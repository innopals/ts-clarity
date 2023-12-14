import { assert, test } from 'vitest';
import { getExtendedStatus, getNodeInfo } from './info.js';

test('get stacks node info', async () => {
  const rs = await getNodeInfo();
  console.log(JSON.stringify(rs, null, 2));
  assert(rs.stacks_tip_height > 0);
});

test('get extended api status', async () => {
  const rs = await getExtendedStatus();
  console.log(JSON.stringify(rs, null, 2));
  assert(rs != null);
  assert(rs.chain_tip != null);
  assert(rs.chain_tip.block_height > 0);
});
