import { assert, test } from 'vitest';
import { richFetch } from './fetch.js';

test('fetch timeout', async () => {
  try {
    await richFetch('https://httpbin.org/ip', {
      timeout: 10,
    });
  } catch (e) {
    // console.log('Stacktrace', (e as Error).stack ?? e);
    assert(String((e as Error).stack).indexOf('fetch.test.ts') > 0);
  }
});
