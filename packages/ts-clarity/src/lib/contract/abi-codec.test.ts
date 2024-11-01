import { bufferCV, tupleCV } from '@stacks/transactions';
import { expect, test } from 'vitest';
import { decodeAbi, encodeAbi } from './abi-codec.js';

const ABI = {
  tuple: [
    {
      name: 'test',
      type: {
        buffer: { length: 10 },
      },
    },
  ],
} as const;

test('encodeAbi', async () => {
  const rs = encodeAbi(ABI, {
    test: Buffer.from([1, 2, 3]),
  });
  expect(rs).deep.equal(tupleCV({ test: bufferCV(Buffer.from([1, 2, 3])) }));
});

test('decodeAbi', async () => {
  const rs = decodeAbi(
    ABI,
    tupleCV({ test: bufferCV(Buffer.from([1, 2, 3])) }),
  );
  const expected: typeof rs = { test: Buffer.from([1, 2, 3]) };
  expect(rs).deep.equal(expected);
});
