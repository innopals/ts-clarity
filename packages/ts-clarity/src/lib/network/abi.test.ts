import { assert, test } from 'vitest';
import { getContractAbi } from './abi.js';

test('abi test', async () => {
  const abi = await getContractAbi(
    'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc',
  );
  console.log(abi);
  assert(Array.isArray(abi.functions));
  assert(Array.isArray(abi.maps));
  assert(Array.isArray(abi.variables));
});
