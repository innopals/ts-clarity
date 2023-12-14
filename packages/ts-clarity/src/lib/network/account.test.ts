import { assert, test } from 'vitest';
import {
  getAccountBalances,
  getAccountInfo,
  getAccountNonces,
} from './account.js';

test('read account info', async () => {
  let rs = await getAccountInfo('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9');
  console.log(rs);
  assert(typeof rs.balance === 'bigint' && rs.balance >= 0n);
  assert(typeof rs.locked === 'bigint' && rs.locked >= 0n);
  assert(typeof rs.nonce === 'number' && rs.nonce > 0);

  rs = await getAccountInfo('SPR0BYQR2DRY07RZV7D21B583KPZD1924DJXY252');
  assert(rs.balance === 0n);
  assert(rs.locked === 0n);
  assert(rs.nonce === 0);
  assert(rs.unlock_height === 0);
});

test('read account nonces', async () => {
  let rs = await getAccountNonces('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9');
  console.log(rs);
  assert(
    typeof rs.last_executed_tx_nonce === 'number' &&
      rs.last_executed_tx_nonce >= -1,
  );
  assert(
    typeof rs.last_mempool_tx_nonce === 'number' &&
      rs.last_mempool_tx_nonce >= -1,
  );
  assert(Array.isArray(rs.detected_missing_nonces));

  rs = await getAccountNonces('SPR0BYQR2DRY07RZV7D21B583KPZD1924DJXY252');

  assert(rs.last_executed_tx_nonce === -1);
  assert(rs.last_mempool_tx_nonce === -1);
  assert(rs.possible_next_nonce === 0);
  assert(
    Array.isArray(rs.detected_missing_nonces) &&
      rs.detected_missing_nonces.length === 0,
  );
});

test('read account balances', async () => {
  let rs = await getAccountBalances(
    'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
  );
  console.log(rs.stx);
  assert(rs.stx.total_fees_sent > 0n);
  assert(rs.stx.total_sent > 0n);
  assert(rs.stx.total_received > 0n);
  assert(rs.stx.balance >= 0n);
  assert(
    rs.fungible_tokens[
      'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token::alex'
    ] != null,
  );
  assert(
    rs.fungible_tokens[
      'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token::alex'
    ].total_received > 0n,
  );
  assert(
    rs.fungible_tokens[
      'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token::alex'
    ].total_sent > 0n,
  );
  rs = await getAccountBalances('SPR0BYQR2DRY07RZV7D21B583KPZD1924DJXY252');
  assert(rs.stx.balance === 0n);
  assert(rs.stx.locked === 0n);
  assert(Object.keys(rs.fungible_tokens).length === 0);
  assert(Object.keys(rs.non_fungible_tokens).length === 0);
  assert(rs.token_offering_locked == null);
});
