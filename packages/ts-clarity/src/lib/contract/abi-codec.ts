import {
  ClarityType,
  type ClarityValue,
  contractPrincipalCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import {
  type ClarityAbiType,
  type InferClarityAbiType,
  isClarityAbiBuffer,
  isClarityAbiList,
  isClarityAbiOptional,
  isClarityAbiPrimitive,
  isClarityAbiResponse,
  isClarityAbiStringAscii,
  isClarityAbiStringUtf8,
  isClarityAbiTuple,
} from 'clarity-abi';
import { assert } from '../common/assert.js';
import { fromUint8Array } from '../utils/buffer.js';

function assertNever(v: never): never {
  throw new Error(`unexpected value: ${v}`);
}

export function encodeAbi<T extends ClarityAbiType>(
  abi: T,
  value: ClarityAbiType extends T ? unknown : InferClarityAbiType<T>,
): ClarityValue {
  if (isClarityAbiPrimitive(abi)) {
    switch (abi) {
      case 'uint128':
        assert(typeof value === 'bigint');
        return {
          type: ClarityType.UInt,
          value,
        };
      case 'int128':
        assert(typeof value === 'bigint');
        return {
          type: ClarityType.Int,
          value,
        };
      case 'bool':
        assert(typeof value === 'boolean');
        return {
          type: value ? ClarityType.BoolTrue : ClarityType.BoolFalse,
        };
      case 'none':
        assert(value == null);
        return {
          type: ClarityType.OptionalNone,
        };
      case 'principal':
        assert(typeof value === 'string');
        if (value.includes('.')) {
          const [address, contractName] = value.split('.');
          assert(address != null && contractName != null);
          return contractPrincipalCV(address, contractName);
        }
        return standardPrincipalCV(value);
      case 'trait_reference': {
        assert(typeof value === 'string');
        assert(value.includes('.'));
        const [address, contractName] = value.split('.');
        assert(address != null && contractName != null);
        return contractPrincipalCV(address, contractName);
      }
      default:
        assertNever(abi);
    }
  }
  if (isClarityAbiStringAscii(abi)) {
    assert(typeof value === 'string');
    return {
      type: ClarityType.StringASCII,
      value,
    };
  }
  if (isClarityAbiStringUtf8(abi)) {
    assert(typeof value === 'string');
    return {
      type: ClarityType.StringUTF8,
      value,
    };
  }
  if (isClarityAbiTuple(abi)) {
    assert(value != null && typeof value === 'object');
    const kv = value as Record<string, unknown>;
    const tuple: ClarityValue = {
      type: ClarityType.Tuple,
      value: {} as Record<string, ClarityValue>,
    };
    for (const def of abi.tuple) {
      const v = kv[def.name];
      tuple.value[def.name] = encodeAbi(def.type, v);
    }
    return tuple;
  }
  if (isClarityAbiResponse(abi)) {
    const response = value as unknown as {
      type: 'success' | 'error';
      value: unknown;
    };
    assert(response.type === 'success' || response.type === 'error');
    if (response.type === 'success') {
      return {
        type: ClarityType.ResponseOk,
        value: encodeAbi(abi.response.ok as ClarityAbiType, response.value),
      };
    }
    return {
      type: ClarityType.ResponseErr,
      value: encodeAbi(abi.response.error, response.value),
    };
  }
  if (isClarityAbiBuffer(abi)) {
    assert(value instanceof Uint8Array);
    return {
      type: ClarityType.Buffer,
      value: fromUint8Array(value).toString('hex'),
    };
  }
  if (isClarityAbiList(abi)) {
    assert(Array.isArray(value));
    return {
      type: ClarityType.List,
      value: value.map((item) => encodeAbi(abi.list.type, item)),
    };
  }
  if (isClarityAbiOptional(abi)) {
    if (value == null) {
      return {
        type: ClarityType.OptionalNone,
      };
    }
    return {
      type: ClarityType.OptionalSome,
      value: encodeAbi(abi.optional, value),
    };
  }
  assertNever(abi);
}

export function decodeAbi<T extends ClarityAbiType>(
  _abi: T,
  cv: ClarityValue,
): ClarityAbiType extends T ? unknown : InferClarityAbiType<T> {
  const abi = _abi as ClarityAbiType;
  if (isClarityAbiPrimitive(abi)) {
    switch (abi) {
      case 'uint128':
        assert(cv.type === ClarityType.UInt);
        return cv.value as unknown as InferClarityAbiType<T>;
      case 'int128':
        assert(cv.type === ClarityType.Int);
        return cv.value as unknown as InferClarityAbiType<T>;
      case 'bool':
        assert(
          cv.type === ClarityType.BoolFalse || cv.type === ClarityType.BoolTrue,
        );
        return (cv.type ===
          ClarityType.BoolTrue) as unknown as InferClarityAbiType<T>;
      case 'none':
        assert(cv.type === ClarityType.OptionalNone);
        return null as unknown as InferClarityAbiType<T>;
      case 'principal':
        assert(
          cv.type === ClarityType.PrincipalStandard ||
            cv.type === ClarityType.PrincipalContract,
        );
        if (cv.type === ClarityType.PrincipalStandard) {
          return cv.value as unknown as InferClarityAbiType<T>;
        }
        return cv.value as unknown as InferClarityAbiType<T>;
      case 'trait_reference':
        assert(cv.type === ClarityType.PrincipalContract);
        return cv.value as unknown as InferClarityAbiType<T>;
      default:
        assertNever(abi);
    }
  }
  if (isClarityAbiStringAscii(abi)) {
    assert(cv.type === ClarityType.StringASCII);
    return cv.value as unknown as InferClarityAbiType<T>;
  }
  if (isClarityAbiStringUtf8(abi)) {
    assert(cv.type === ClarityType.StringUTF8);
    return cv.value as unknown as InferClarityAbiType<T>;
  }
  if (isClarityAbiTuple(abi)) {
    assert(cv.type === ClarityType.Tuple);
    const tuple: Record<string, unknown> = {};
    for (const def of abi.tuple) {
      const v = cv.value[def.name];
      assert(v != null);
      tuple[def.name] = decodeAbi(def.type, v);
    }
    return tuple as unknown as InferClarityAbiType<T>;
  }
  if (isClarityAbiResponse(abi)) {
    assert(
      cv.type === ClarityType.ResponseOk || cv.type === ClarityType.ResponseErr,
    );
    if (cv.type === ClarityType.ResponseOk) {
      return {
        type: 'success',
        value: decodeAbi(abi.response.ok, cv.value),
      } as unknown as InferClarityAbiType<T>;
    }
    return {
      type: 'error',
      error: decodeAbi(abi.response.error, cv.value),
    } as unknown as InferClarityAbiType<T>;
  }
  if (isClarityAbiBuffer(abi)) {
    assert(cv.type === ClarityType.Buffer);
    return Buffer.from(cv.value, 'hex') as unknown as InferClarityAbiType<T>;
  }
  if (isClarityAbiList(abi)) {
    assert(cv.type === ClarityType.List);
    return cv.value.map((item) =>
      decodeAbi(abi.list.type, item),
    ) as unknown as InferClarityAbiType<T>;
  }
  if (isClarityAbiOptional(abi)) {
    assert(
      cv.type === ClarityType.OptionalNone ||
        cv.type === ClarityType.OptionalSome,
    );
    if (cv.type === ClarityType.OptionalNone) {
      return null as unknown as InferClarityAbiType<T>;
    }
    return decodeAbi(
      abi.optional,
      cv.value,
    ) as unknown as InferClarityAbiType<T>;
  }
  assertNever(abi);
}
