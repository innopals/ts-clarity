import type { ClarityAbi } from 'clarity-abi';
import { SIP010TraitABI } from 'clarity-abi/abis';
import { assert, assertType, test } from 'vitest';
import { callReadonly, unwrapResponse } from './call-readonly.js';

test('call readonly without args', async () => {
  const rs = await callReadonly({
    abi: SIP010TraitABI.functions,
    functionName: 'get-total-supply',
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
  });
  console.log(rs);
  assert(rs.type === 'success');
  assert(rs.value > 0n);
});

test('call readonly with args', async () => {
  const rs = await callReadonly({
    abi: SIP010TraitABI.functions,
    functionName: 'get-balance',
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
    args: {
      who: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
    },
  });
  console.log(rs);

  const unwrapped = unwrapResponse(rs);
  assertType<bigint>(unwrapped);

  assert(rs.type === 'success');
  assert(rs.value > 0n);
});

test('call readonly with unknown ABI', async () => {
  const abi: ClarityAbi = SIP010TraitABI;
  const rs = await callReadonly({
    abi: abi.functions,
    functionName: 'get-total-supply',
    contract: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
  });
  console.log(rs);
});
