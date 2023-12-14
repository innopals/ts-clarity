import fetch from 'cross-fetch';
import {
  kDefaultExtendedApiRequestTimeout,
  kDefaultStacksMainnetEndpoint,
  kDefaultStacksReadRetries,
  kDefaultStacksTimeout,
} from '../common/constants.js';
import {
  type RequestTimeoutRetryParams,
  exponentialBackoff,
} from '../common/fetch.js';

export type RequestOptions = {
  stacksEndpoint?: string;
} & Omit<RequestTimeoutRetryParams, 'retryOn'>;

export function mergeDefaultExtendedApiRequestOptions(
  options?: RequestOptions,
): Required<RequestOptions> {
  return {
    stacksEndpoint: options?.stacksEndpoint ?? kDefaultStacksMainnetEndpoint,
    timeout: options?.timeout ?? kDefaultExtendedApiRequestTimeout,
    fetch: options?.fetch ?? fetch,
    retries: options?.retries ?? kDefaultStacksReadRetries,
    retryDelay: options?.retryDelay ?? exponentialBackoff(),
  };
}

export function mergeDefaultNodeApiRequestOptions(
  options?: RequestOptions,
): Required<RequestOptions> {
  return {
    stacksEndpoint: options?.stacksEndpoint ?? kDefaultStacksMainnetEndpoint,
    timeout: options?.timeout ?? kDefaultStacksTimeout,
    fetch: options?.fetch ?? fetch,
    retries: options?.retries ?? kDefaultStacksReadRetries,
    retryDelay: options?.retryDelay ?? exponentialBackoff(),
  };
}
