import {
  type ClarityValue,
  cvToHex,
  deserializeCV,
} from '@stacks/transactions';
import type {
  ClarityAbiFunction,
  HexString,
  TContractPrincipal,
  TPrincipal,
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
import { decodeAbi, encodeAbi } from './abi-codec.js';
import { kDefaultStacksEndpoint } from './constants.js';
import type {
  InferReadonlyCallParameterType,
  InferReadonlyCallResultType,
} from './contract.js';

export type ReadonlyCallRuntimeOptions = {
  sender?: TPrincipal;
  contract: TContractPrincipal;
  stacksEndpoint?: string;
  indexBlockHash?: HexString | Uint8Array;
} & Omit<RequestTimeoutRetryParams, 'retryOn'>;

export async function callReadonly<
  Functions extends readonly ClarityAbiFunction[] | readonly unknown[],
  FunctionName extends string,
>(
  params: InferReadonlyCallParameterType<Functions, FunctionName> &
    ReadonlyCallRuntimeOptions,
): Promise<InferReadonlyCallResultType<Functions, FunctionName>> {
  const stacksEndpoint = params.stacksEndpoint ?? kDefaultStacksEndpoint;
  const urlParams = new URLSearchParams();
  if (typeof params.indexBlockHash === 'string') {
    urlParams.set('tip', params.indexBlockHash.substring(2).toLowerCase());
  } else if (params.indexBlockHash instanceof Uint8Array) {
    urlParams.set('tip', fromUint8Array(params.indexBlockHash).toString('hex'));
  }

  const [deployer, contractName] = params.contract.split('.', 2);
  const fn = String(params.functionName);
  const args: ClarityValue[] = [];
  const functionDef = (params.abi as readonly ClarityAbiFunction[]).find(
    (def) => def.name === params.functionName,
  );
  assert(
    functionDef != null,
    `failed to find function definition for ${params.functionName}`,
  );
  const argsKV = (params as unknown as { args: Record<string, unknown> }).args;
  for (const argDef of functionDef.args) {
    args.push(encodeAbi(argDef.type, argsKV[argDef.name]));
  }

  const url = `${stacksEndpoint}/v2/contracts/call-read/${deployer}/${contractName}/${fn}?${urlParams.toString()}`;
  const body = JSON.stringify({
    sender: params.sender ?? deployer,
    arguments: args.map(cvToHex),
  });
  const funcResponse = await richFetch(url, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    fetch: params.fetch,
    timeout: params.timeout ?? kDefaultStacksTimeout,
    retries: params.retries ?? kDefaultStacksReadRetries,
    retryDelay: params.retryDelay ?? exponentialBackoff(),
    retryOn: retryOnError,
  });
  if (funcResponse.status !== 200) {
    throw new Error(
      `Readonly call failed with http code ${funcResponse.status}: ${funcResponse.statusText}`,
    );
  }
  const funcResult = await funcResponse.json();
  if (funcResult.okay !== true) {
    throw new Error(`Readonly call failed with error: ${funcResult.cause}`);
  }
  const result = deserializeCV(funcResult.result);
  return decodeAbi(
    functionDef.outputs.type,
    result,
  ) as unknown as InferReadonlyCallResultType<Functions, FunctionName>;
}

export function unwrapResponse<T>(
  response:
    | {
        type: 'success';
        value: T;
      }
    | {
        type: 'error';
        error: unknown;
      },
): T {
  if (response.type === 'success') {
    return response.value;
  }
  throw new Error(`Clarity ResponseErr: ${response.error}`);
}
