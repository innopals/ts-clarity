import { assert, test } from 'vitest';
import { getTransaction } from './transaction.js';

test('get transaction', async () => {
  const rs = await getTransaction(
    '0x460353087a14a6570647ef3892e3e888b2384b74b5b695c852230a49180816ea',
  );
  console.log(JSON.stringify(rs, null, 2));
  assert(rs != null);
  assert(
    rs.tx_id ===
      '0x460353087a14a6570647ef3892e3e888b2384b74b5b695c852230a49180816ea',
  );
  assert(rs.nonce === 89);
  assert(rs.sender_address === 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9');
  assert(rs.block_height === 44447);
  assert(rs.tx_status === 'success');
});

test('transaction not found', async () => {
  const rs = await getTransaction(
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  );
  assert(rs === null);
});
