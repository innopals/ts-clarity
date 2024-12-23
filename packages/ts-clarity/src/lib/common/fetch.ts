/// <reference lib="dom" />

import fetch from 'cross-fetch';

const kDefaultRequestTimeout = 60_000;

export type RequestDelayFunction = (
  attempt: number,
  error: unknown | null,
  response: Response | null,
) => number;

export type RequestRetryOnFunction = (
  attempt: number,
  error: unknown | null,
  response: Response | null,
) => boolean | Promise<boolean>;

export interface RequestTimeoutRetryParams {
  fetch?: typeof fetch | undefined;
  timeout?: number | undefined;
  retries?: number | undefined;
  retryDelay?: number | RequestDelayFunction | undefined;
  retryOn?: number[] | RequestRetryOnFunction | undefined;
}

export function exponentialBackoff(
  initDelay = 1000,
  maxDelay = 60_0000,
): RequestDelayFunction {
  return (attempt) => {
    return Math.min(maxDelay, 2 ** attempt * initDelay);
  };
}

export function retryOnError(
  _attempt: number,
  error: unknown | null,
  response: Response | null,
) {
  if (error != null) return true;
  if (response != null) {
    if (response.status === 429 || response.status >= 500) return true;
  }
  return false;
}

function throwWithStackTrace(e: unknown) {
  if (e instanceof Error) {
    e.stack += `\n${new Error().stack}`;
  }
  throw e;
}

export async function richFetch(
  url: string | URL,
  options?: RequestInit & RequestTimeoutRetryParams,
): Promise<Response> {
  const doFetch = options?.fetch ?? fetch;
  const timeout = options?.timeout ?? kDefaultRequestTimeout;
  const retries = options?.retries ?? 1;
  const retryDelay: RequestDelayFunction =
    typeof options?.retryDelay === 'function'
      ? options.retryDelay
      : () =>
          typeof options?.retryDelay === 'number' ? options.retryDelay : 0;
  const retryOn: RequestRetryOnFunction =
    typeof options?.retryOn === 'function'
      ? options.retryOn
      : (_, _err, response) =>
          Array.isArray(options?.retryOn) &&
          response != null &&
          options.retryOn.includes(response.status);
  const timeoutError = new Error(`request timeout after ${timeout}ms`);
  for (let attempt = 0; attempt < retries; attempt++) {
    const abortController = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = setTimeout(
      () => abortController.abort(timeoutError),
      timeout,
    );
    const onCancel = (e: Event) => abortController.abort(e);
    if (options?.signal != null) {
      options.signal.addEventListener('abort', onCancel);
    }
    let response: Response | null = null;
    try {
      response = await doFetch(url, {
        ...options,
        signal: abortController.signal,
      });
      if (await retryOn(attempt, null, response)) {
        const delay = retryDelay(attempt, null, response);
        await new Promise((f) => setTimeout(f, delay));
        continue;
      }
      return response;
    } catch (e: unknown) {
      if (attempt + 1 >= retries) throwWithStackTrace(e);
      if (await retryOn(attempt, e, response)) {
        const delay = retryDelay(attempt, e, response);
        await new Promise((f) => setTimeout(f, delay));
        continue;
      }
      throwWithStackTrace(e);
    } finally {
      clearTimeout(timer);
      timer = null;
    }
  }
  // Should never reach here.
  throw new Error(`Request failed after ${retries} attempts.`);
}
