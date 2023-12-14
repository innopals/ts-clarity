import type { Transaction } from '@stacks/stacks-blockchain-api-types';
import { retryOnError, richFetch } from '../common/fetch.js';
import {
  type RequestOptions,
  mergeDefaultExtendedApiRequestOptions,
} from './request.js';

export async function getTransaction(
  txid: string,
  _options?: RequestOptions & {
    unanchored?: boolean;
  },
): Promise<Transaction | null> {
  const options = mergeDefaultExtendedApiRequestOptions(_options);
  const url = `${options.stacksEndpoint}/extended/v1/tx/${
    txid.startsWith('0x') ? txid : `0x${txid}`
  }`;
  const rs = await richFetch(url, {
    timeout: options.timeout,
    fetch: options.fetch,
    retries: options.retries,
    retryDelay: options.retryDelay,
    retryOn: retryOnError,
  });
  if (rs.status === 404) return null;
  return await rs.json();
}
