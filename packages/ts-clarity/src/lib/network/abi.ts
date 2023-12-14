import type { ClarityAbi, TContractPrincipal } from 'clarity-abi';
import { retryOnError, richFetch } from '../common/fetch.js';
import {
  type RequestOptions,
  mergeDefaultNodeApiRequestOptions,
} from './request.js';

export async function getContractAbi(
  contract: TContractPrincipal,
  _options?: RequestOptions & {
    includePrivate?: boolean;
  },
): Promise<ClarityAbi> {
  const options = mergeDefaultNodeApiRequestOptions(_options);
  const [deployer, contractName] = contract.split('.', 2);
  const url = `${options.stacksEndpoint}/v2/contracts/interface/${deployer}/${contractName}`;
  const rs = await richFetch(url, {
    timeout: options.timeout,
    fetch: options.fetch,
    retries: options.retries,
    retryDelay: options.retryDelay,
    retryOn: retryOnError,
  });
  if (rs.status === 404) {
    throw new Error(
      `Contract ${deployer}.${contractName} not found from ${url}`,
    );
  }
  if (rs.status !== 200) {
    throw new Error(
      `Failed to fetch abi from ${url}, status code: ${rs.status}: ${rs.statusText}`,
    );
  }
  const abi: ClarityAbi = await rs.json();
  if (_options?.includePrivate !== true) {
    abi.functions = abi.functions.filter((fn) => fn.access !== 'private');
  }
  return abi;
}
