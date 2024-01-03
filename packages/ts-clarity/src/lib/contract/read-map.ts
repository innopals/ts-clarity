import {
  ClarityType,
  type ClarityValue,
  cvToHex,
  deserializeCV,
} from '@stacks/transactions';
import type { ClarityAbiMap, HexString, TContractPrincipal } from 'clarity-abi';
import { assert } from '../common/assert.js';
import {
  kDefaultStacksReadRetries,
  kDefaultStacksTimeout,
} from '../common/constants.js';
import {
  type RequestTimeoutRetryParams,
  exponentialBackoff,
  retryOnError,
  richFetch,
} from '../common/fetch.js';
import { fromUint8Array } from '../utils/buffer.js';
import { decodeAbi, encodeAbi } from './abi-codec.js';
import { kDefaultStacksEndpoint } from './constants.js';
import type {
  InferMapValueType,
  InferReadMapParameterType,
} from './contract.js';

export type ReadMapRuntimeParameters = {
  contract: TContractPrincipal;
  stacksEndpoint?: string;
  proof?: boolean;
  indexBlockHash?: HexString | Uint8Array;
} & Omit<RequestTimeoutRetryParams, 'retryOn'>;

export async function readMap<
  Maps extends
    | readonly ClarityAbiMap[]
    | readonly unknown[] = readonly ClarityAbiMap[],
  MapName extends string = string,
>(
  params: InferReadMapParameterType<Maps, MapName> & ReadMapRuntimeParameters,
): Promise<InferMapValueType<Maps, MapName> | null> {
  const { stacksEndpoint, proof, indexBlockHash, contract, mapName } = params;
  const mapDef = (params.abi as readonly ClarityAbiMap[]).find(
    (m) => m.name === params.mapName,
  );
  assert(mapDef != null, `failed to find map definition for ${params.mapName}`);
  const urlParams = new URLSearchParams();
  urlParams.set('proof', proof === true ? '1' : '0');
  if (typeof indexBlockHash === 'string') {
    urlParams.set('tip', indexBlockHash.substring(2).toLowerCase());
  } else if (indexBlockHash instanceof Uint8Array) {
    urlParams.set('tip', fromUint8Array(indexBlockHash).toString('hex'));
  }

  const [deployer, contractName] = contract.split('.', 2);
  const key: ClarityValue = encodeAbi(mapDef.key, params.key);

  const url = `${
    stacksEndpoint ?? kDefaultStacksEndpoint
  }/v2/map_entry/${deployer}/${contractName}/${mapName}?${urlParams.toString()}`;
  const funcResponse = await richFetch(url, {
    method: 'POST',
    body: `"${cvToHex(key)}"`,
    headers: { 'Content-Type': 'application/json' },
    fetch: params.fetch,
    timeout: params.timeout ?? kDefaultStacksTimeout,
    retries: params.retries ?? kDefaultStacksReadRetries,
    retryDelay: params.retryDelay ?? exponentialBackoff(),
    retryOn: retryOnError,
  });
  if (funcResponse.status !== 200) {
    throw new Error(
      `Read contract map failed with http code ${funcResponse.status}: ${funcResponse.statusText}`,
    );
  }
  const mapResult = await funcResponse.json();
  const result = deserializeCV(mapResult.data);
  if (result.type === ClarityType.OptionalNone) return null;
  assert(
    result.type === ClarityType.OptionalSome,
    `unexpected map value: ${result}`,
  );
  return decodeAbi(mapDef.value, result.value) as unknown as InferMapValueType<
    Maps,
    MapName
  >;
}
