import type { ClarityAbi } from 'clarity-abi';
import { assert, test } from 'vitest';
import ammSwapPoolV11 from '../../../test/abis/amm-swap-pool-v1-1.js';
import { readVariable } from './read-variable.js';

test('read variable', async () => {
  const rs = await readVariable({
    abi: ammSwapPoolV11.variables,
    variableName: 'contract-owner',
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1',
  });
  assert(String(rs) === 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9');
});

test('read variable with unknown ABI', async () => {
  const abi: ClarityAbi = ammSwapPoolV11 as unknown as ClarityAbi;
  const rs = await readVariable({
    abi: abi.variables,
    variableName: 'contract-owner',
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1',
  });
  assert(String(rs) === 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9');
});
