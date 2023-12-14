import type {
  CoreNodeInfoResponse,
  ServerStatusResponse,
} from '@stacks/stacks-blockchain-api-types';
import { retryOnError, richFetch } from '../common/fetch.js';
import {
  type RequestOptions,
  mergeDefaultExtendedApiRequestOptions,
  mergeDefaultNodeApiRequestOptions,
} from './request.js';

export async function getNodeInfo(
  _options?: RequestOptions,
): Promise<CoreNodeInfoResponse> {
  const options = mergeDefaultNodeApiRequestOptions(_options);
  const url = `${options.stacksEndpoint}/v2/info`;
  const rs = await richFetch(url, {
    timeout: options.timeout,
    fetch: options.fetch,
    retries: options.retries,
    retryDelay: options.retryDelay,
    retryOn: retryOnError,
  });
  return await rs.json();
}

export async function getExtendedStatus(
  _options?: RequestOptions,
): Promise<Required<ServerStatusResponse> | null> {
  const options = mergeDefaultExtendedApiRequestOptions(_options);
  const url = `${options.stacksEndpoint}/extended/v1/status`;
  const rs = await richFetch(url, {
    timeout: options.timeout,
    fetch: options.fetch,
    retries: options.retries,
    retryDelay: options.retryDelay,
    retryOn: retryOnError,
  });
  const status: ServerStatusResponse = await rs.json();
  if (status.status !== 'ready') return null;
  return status as Required<ServerStatusResponse>;
}
