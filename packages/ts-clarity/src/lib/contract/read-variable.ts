import { deserializeCV } from '@stacks/transactions';
import type {
  ClarityAbiVariable,
  HexString,
  TContractPrincipal,
} from 'clarity-abi';
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
import { decodeAbi } from './abi-codec.js';
import { kDefaultStacksEndpoint } from './constants.js';
import type {
  InferReadVariableParameterType,
  InferVariableType,
} from './contract.js';

export type ReadVariableRuntimeParameterType = {
  contract: TContractPrincipal;
  stacksEndpoint?: string;
  proof?: boolean;
  indexBlockHash?: HexString | Uint8Array;
} & Omit<RequestTimeoutRetryParams, 'retryOn'>;

export async function readVariable<
  Variables extends
    | readonly ClarityAbiVariable[]
    | readonly unknown[] = readonly ClarityAbiVariable[],
  VariableName extends string = string,
>(
  params: InferReadVariableParameterType<Variables, VariableName> &
    ReadVariableRuntimeParameterType,
): Promise<InferVariableType<Variables, VariableName>> {
  const { stacksEndpoint, proof, indexBlockHash, contract, variableName, abi } =
    params;
  const varDef = (abi as readonly ClarityAbiVariable[]).find(
    (def) => def.name === variableName,
  );
  assert(
    varDef != null,
    `failed to find variable definition for ${variableName}`,
  );
  const urlParams = new URLSearchParams();
  urlParams.set('proof', proof === true ? '1' : '0');
  if (typeof indexBlockHash === 'string') {
    urlParams.set('tip', indexBlockHash.substring(2).toLowerCase());
  } else if (indexBlockHash instanceof Uint8Array) {
    urlParams.set('tip', fromUint8Array(indexBlockHash).toString('hex'));
  }

  const [deployer, contractName] = contract.split('.', 2);
  const vn = String(variableName);

  const url = `${
    stacksEndpoint ?? kDefaultStacksEndpoint
  }/v2/data_var/${deployer}/${contractName}/${vn}?${urlParams.toString()}`;
  const funcResponse = await richFetch(url, {
    method: 'GET',
    fetch: params.fetch,
    timeout: params.timeout ?? kDefaultStacksTimeout,
    retries: params.retries ?? kDefaultStacksReadRetries,
    retryDelay: params.retryDelay ?? exponentialBackoff(),
    retryOn: retryOnError,
  });
  if (funcResponse.status !== 200) {
    throw new Error(
      `Read contract variable failed with http code ${funcResponse.status}: ${funcResponse.statusText}`,
    );
  }
  const mapResult = await funcResponse.json();
  const result = deserializeCV(mapResult.data);
  return decodeAbi(varDef.type, result) as unknown as InferVariableType<
    Variables,
    VariableName
  >;
}
