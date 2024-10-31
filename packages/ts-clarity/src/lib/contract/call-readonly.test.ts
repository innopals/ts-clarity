import { cvToString } from '@stacks/transactions';
import type { ClarityAbi } from 'clarity-abi';
import { SIP010TraitABI } from 'clarity-abi/abis';
import { assert, assertType, test } from 'vitest';
import { callReadonly, unwrapResponse } from './call-readonly.js';
import { makeFunctionArgs } from './contract.js';

test('call readonly without args', async () => {
  const rs = await callReadonly({
    abi: SIP010TraitABI.functions,
    functionName: 'get-total-supply',
    contract: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
  });
  console.log(rs);
  assert(rs.type === 'success');
  assert(rs.value > 0n);
});

test('call readonly with args', async () => {
  const rs = await callReadonly({
    abi: SIP010TraitABI.functions,
    functionName: 'get-balance',
    contract: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
    args: {
      who: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.amm-vault-v2-01',
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
    contract: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
  });
  console.log(rs);
});

test('make function args', async () => {
  const args = makeFunctionArgs({
    abi: SIP010TraitABI.functions,
    functionName: 'burn',
    args: {
      amount: 0n,
      sender: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM',
    },
  });
  assert(
    args.map((cv) => cvToString(cv)).join(',') ===
      'u0,SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM',
  );
});
