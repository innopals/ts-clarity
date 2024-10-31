import type { ClarityAbi } from 'clarity-abi';
import { assert, test } from 'vitest';
import AmmVault from '../../../test/abis/amm-vault-v2-01.js';
import { readMap } from './read-map.js';

test('read map', async () => {
  const rs = await readMap({
    abi: AmmVault.maps,
    mapName: 'approved-tokens',
    key: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
    contract: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-vault-v2-01',
  });
  console.log(rs);
  assert(rs != null && rs === true);
});

test('read map with unknown abi', async () => {
  const abi: ClarityAbi = AmmVault as unknown as ClarityAbi;
  let rs = await readMap({
    abi: abi.maps,
    mapName: 'reserve',
    contract: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-vault-v2-01',
    key: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
  });
  console.log(rs);
  rs = {};
});
