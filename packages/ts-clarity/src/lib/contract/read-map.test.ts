import type { ClarityAbi } from 'clarity-abi';
import { assert, test } from 'vitest';
import ammSwapPoolV11 from '../../../test/abis/amm-swap-pool-v1-1.js';
import { readMap } from './read-map.js';

test('read map', async () => {
  const rs = await readMap({
    abi: ammSwapPoolV11.maps,
    mapName: 'pools-id-map',
    key: 1n,
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1',
  });
  console.log(rs);
  assert(rs != null);
  assert(rs.factor > 0n);
});

test('read map with unknown abi', async () => {
  const abi: ClarityAbi = ammSwapPoolV11 as unknown as ClarityAbi;
  let rs = await readMap({
    abi: abi.maps,
    mapName: 'pools-id-map',
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.amm-swap-pool-v1-1',
    key: 1n,
  });
  console.log(rs);
  rs = {};
});
