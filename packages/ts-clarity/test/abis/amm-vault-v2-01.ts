/* eslint-disable */
export default {
  maps: [
    { key: 'principal', name: 'approved-flash-loan-users', value: 'bool' },
    { key: 'principal', name: 'approved-tokens', value: 'bool' },
    { key: 'principal', name: 'reserve', value: 'uint128' },
  ],
  epoch: 'Epoch25',
  functions: [
    {
      args: [{ name: 'flash-loan-user-trait', type: 'principal' }],
      name: 'check-is-approved-flash-loan-user',
      access: 'private',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [{ name: 'flash-loan-token', type: 'principal' }],
      name: 'check-is-approved-token',
      access: 'private',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [
        { name: 'a', type: 'uint128' },
        { name: 'b', type: 'uint128' },
      ],
      name: 'mul-down',
      access: 'private',
      outputs: { type: 'uint128' },
    },
    {
      args: [
        { name: 'a', type: 'uint128' },
        { name: 'b', type: 'uint128' },
      ],
      name: 'mul-up',
      access: 'private',
      outputs: { type: 'uint128' },
    },
    {
      args: [
        { name: 'token-trait', type: 'principal' },
        { name: 'amount', type: 'uint128' },
      ],
      name: 'add-to-reserve',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [
        { name: 'flash-loan-user-trait', type: 'trait_reference' },
        { name: 'token-trait', type: 'trait_reference' },
        { name: 'amount', type: 'uint128' },
        { name: 'memo', type: { optional: { buffer: { length: 16 } } } },
      ],
      name: 'flash-loan',
      access: 'public',
      outputs: { type: { response: { ok: 'uint128', error: 'uint128' } } },
    },
    {
      args: [{ name: 'new-paused', type: 'bool' }],
      name: 'pause',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [
        { name: 'token-trait', type: 'principal' },
        { name: 'amount', type: 'uint128' },
      ],
      name: 'remove-from-reserve',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [
        { name: 'flash-loan-user-trait', type: 'principal' },
        { name: 'approved', type: 'bool' },
      ],
      name: 'set-approved-flash-loan-user',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [
        { name: 'token-trait', type: 'principal' },
        { name: 'approved', type: 'bool' },
      ],
      name: 'set-approved-token',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [{ name: 'enabled', type: 'bool' }],
      name: 'set-flash-loan-enabled',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [{ name: 'fee', type: 'uint128' }],
      name: 'set-flash-loan-fee-rate',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [
        { name: 'token-trait', type: 'trait_reference' },
        { name: 'amount', type: 'uint128' },
        { name: 'recipient', type: 'principal' },
      ],
      name: 'transfer-ft',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [
        { name: 'token-x-trait', type: 'trait_reference' },
        { name: 'dx', type: 'uint128' },
        { name: 'token-y-trait', type: 'trait_reference' },
        { name: 'dy', type: 'uint128' },
        { name: 'recipient', type: 'principal' },
      ],
      name: 'transfer-ft-two',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [
        { name: 'token-trait', type: 'trait_reference' },
        { name: 'token-id', type: 'uint128' },
        { name: 'amount', type: 'uint128' },
        { name: 'recipient', type: 'principal' },
      ],
      name: 'transfer-sft',
      access: 'public',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [],
      name: 'get-flash-loan-enabled',
      access: 'read_only',
      outputs: { type: 'bool' },
    },
    {
      args: [],
      name: 'get-flash-loan-fee-rate',
      access: 'read_only',
      outputs: { type: 'uint128' },
    },
    {
      args: [{ name: 'token-trait', type: 'principal' }],
      name: 'get-reserve',
      access: 'read_only',
      outputs: { type: 'uint128' },
    },
    {
      args: [],
      name: 'is-dao-or-extension',
      access: 'read_only',
      outputs: { type: { response: { ok: 'bool', error: 'uint128' } } },
    },
    {
      args: [],
      name: 'is-paused',
      access: 'read_only',
      outputs: { type: 'bool' },
    },
  ],
  variables: [
    {
      name: 'ERR-AMOUNT-EXCEED-RESERVE',
      type: { response: { ok: 'none', error: 'uint128' } },
      access: 'constant',
    },
    {
      name: 'ERR-INVALID-BALANCE',
      type: { response: { ok: 'none', error: 'uint128' } },
      access: 'constant',
    },
    {
      name: 'ERR-INVALID-TOKEN',
      type: { response: { ok: 'none', error: 'uint128' } },
      access: 'constant',
    },
    {
      name: 'ERR-NOT-AUTHORIZED',
      type: { response: { ok: 'none', error: 'uint128' } },
      access: 'constant',
    },
    {
      name: 'ERR-PAUSED',
      type: { response: { ok: 'none', error: 'uint128' } },
      access: 'constant',
    },
    { name: 'ONE_8', type: 'uint128', access: 'constant' },
    { name: 'flash-loan-enabled', type: 'bool', access: 'variable' },
    { name: 'flash-loan-fee-rate', type: 'uint128', access: 'variable' },
    { name: 'paused', type: 'bool', access: 'variable' },
  ],
  clarity_version: 'Clarity2',
  fungible_tokens: [],
  non_fungible_tokens: [],
} as const;
