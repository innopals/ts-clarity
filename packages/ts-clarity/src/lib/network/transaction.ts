import type {
  MempoolTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import {
  type StacksTransactionWire,
  deserializeTransaction,
} from '@stacks/transactions';
import { retryOnError, richFetch } from '../common/fetch.js';
import {
  type RequestOptions,
  mergeDefaultExtendedApiRequestOptions,
  mergeDefaultNodeApiRequestOptions,
} from './request.js';

export async function getTransaction(
  txid: string,
  _options?: RequestOptions,
): Promise<Transaction | MempoolTransaction | null> {
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

export async function getMempoolTransaction(
  txid: string,
  _options?: RequestOptions,
): Promise<StacksTransactionWire | null> {
  const options = mergeDefaultNodeApiRequestOptions(_options);
  const url = `${options.stacksEndpoint}/v2/transactions/unconfirmed/${
    txid.startsWith('0x') ? txid.substring(2) : txid
  }`;
  const rs = await richFetch(url, {
    timeout: options.timeout,
    fetch: options.fetch,
    retries: options.retries,
    retryDelay: options.retryDelay,
    retryOn: retryOnError,
  });
  if (rs.status === 404) return null;
  const { tx, status } = await rs.json();
  if (status !== 'Mempool') return null;
  return deserializeTransaction(tx);
}
