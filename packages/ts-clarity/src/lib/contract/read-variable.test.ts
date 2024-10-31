import type { ClarityAbi } from 'clarity-abi';
import { assert, test } from 'vitest';
import AmmVault from '../../../test/abis/amm-vault-v2-01.js';
import { readVariable } from './read-variable.js';

test('read variable', async () => {
  const rs = await readVariable({
    abi: AmmVault.variables,
    variableName: 'paused',
    contract: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-vault-v2-01',
  });
  assert(rs === false);
});

test('read variable with unknown ABI', async () => {
  const abi: ClarityAbi = AmmVault as unknown as ClarityAbi;
  const rs = await readVariable({
    abi: abi.variables,
    variableName: 'paused',
    contract: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-vault-v2-01',
  });
  assert(rs === false);
});
