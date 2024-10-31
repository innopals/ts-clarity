import type { ClarityValue } from '@stacks/transactions';
import type {
  ClarityAbiFunction,
  ClarityAbiMap,
  ClarityAbiType,
  ClarityAbiVariable,
  GetFunctionByName,
  GetMapByName,
  GetVariableByName,
  InferClarityAbiType,
  InferClarityAbiTypeTuple,
  MergeUnion,
} from 'clarity-abi';
import { assert } from '../common/assert.js';
import { encodeAbi } from './abi-codec.js';

//////////////////////////////////////////////////////////////////////
// Functions

export type InferFunctionName<
  Functions extends
    | readonly ClarityAbiFunction[]
    | readonly unknown[] = readonly ClarityAbiFunction[],
  FunctionName extends string | undefined = string,
  V extends ClarityAbiFunction['access'] = ClarityAbiFunction['access'],
> = Functions extends readonly ClarityAbiFunction[]
  ? Extract<
      Functions[number],
      { access: V }
    >['name'] extends infer FunctionNames
    ?
        | FunctionNames
        | (FunctionName extends FunctionNames ? FunctionName : never)
        | (ClarityAbiFunction[] extends Functions ? string : never)
    : never
  : FunctionName;

export type InferFunctionArgsType<
  Functions extends readonly ClarityAbiFunction[],
  FunctionName extends Functions[number]['name'],
  V extends ClarityAbiFunction['access'] = 'read_only' | 'public',
  TFunction extends ClarityAbiFunction = GetFunctionByName<
    Functions,
    FunctionName,
    V
  >,
  TArgs extends
    | Record<string, unknown>
    | never = TFunction extends ClarityAbiFunction
    ? InferClarityAbiTypeTuple<TFunction['args']>
    : never,
> = [TArgs] extends [never]
  ? { args?: unknown }
  : {} extends TArgs
    ? {}
    : { args: MergeUnion<TArgs> };

export type InferReadonlyCallResultType<
  Functions extends
    | readonly ClarityAbiFunction[]
    | readonly unknown[] = readonly ClarityAbiFunction[],
  FunctionName extends string = string,
  V extends ClarityAbiFunction['access'] = 'read_only' | 'public',
  TFunction extends
    ClarityAbiFunction = Functions extends readonly ClarityAbiFunction[]
    ? GetFunctionByName<Functions, FunctionName, V>
    : ClarityAbiFunction,
  TResult = InferClarityAbiType<TFunction['outputs']['type']>,
> = [TResult] extends [never] ? unknown : TResult;

export type InferReadonlyCallParameterType<
  Functions extends
    | readonly ClarityAbiFunction[]
    | readonly unknown[] = readonly ClarityAbiFunction[],
  FunctionName extends string = string,
> = {
  abi: Functions;
  functionName: InferFunctionName<Functions, FunctionName, 'read_only'>;
} & (Functions extends readonly ClarityAbiFunction[]
  ? InferFunctionArgsType<Functions, FunctionName, 'read_only'>
  : { args?: unknown });

export type InferCallParameterType<
  Functions extends
    | readonly ClarityAbiFunction[]
    | readonly unknown[] = readonly ClarityAbiFunction[],
  FunctionName extends string = string,
> = {
  abi: Functions;
  functionName: InferFunctionName<
    Functions,
    FunctionName,
    'read_only' | 'public' | 'private'
  >;
} & (Functions extends readonly ClarityAbiFunction[]
  ? InferFunctionArgsType<
      Functions,
      FunctionName,
      'read_only' | 'public' | 'private'
    >
  : { args?: unknown });

//////////////////////////////////////////////////////////////////////
// Maps

export type InferMapName<
  Maps extends
    | readonly ClarityAbiMap[]
    | readonly unknown[] = readonly ClarityAbiMap[],
  MapName extends string | undefined = string,
> = Maps extends readonly ClarityAbiMap[]
  ? Maps[number]['name'] extends infer MapNames
    ?
        | MapNames
        | (MapName extends MapNames ? MapName : never)
        | (ClarityAbiMap[] extends Maps ? string : never)
    : never
  : MapName;

export type InferMapKeyType<
  Maps extends
    | readonly ClarityAbiMap[]
    | readonly unknown[] = readonly ClarityAbiMap[],
  MapName extends string = string,
  TMap extends ClarityAbiMap = Maps extends readonly ClarityAbiMap[]
    ? GetMapByName<Maps, MapName>
    : ClarityAbiMap,
  TKey = TMap['key'] extends infer T
    ? T extends ClarityAbiType
      ? InferClarityAbiType<T>
      : never
    : never,
> = [TKey] extends [never]
  ? { key: unknown }
  : {} extends TKey
    ? {}
    : { key: TKey };

export type InferMapValueType<
  Maps extends
    | readonly ClarityAbiMap[]
    | readonly unknown[] = readonly ClarityAbiMap[],
  MapName extends string = string,
  TMap extends ClarityAbiMap = Maps extends readonly ClarityAbiMap[]
    ? GetMapByName<Maps, MapName>
    : ClarityAbiMap,
  TValue = InferClarityAbiType<TMap['value']>,
> = [TValue] extends [never] ? unknown : TValue;

export type InferReadMapParameterType<
  Maps extends
    | readonly ClarityAbiMap[]
    | readonly unknown[] = readonly ClarityAbiMap[],
  MapName extends string = string,
> = {
  abi: Maps;
  mapName: InferMapName<Maps, MapName>;
} & InferMapKeyType<Maps, MapName>;

//////////////////////////////////////////////////////////////////////
// Variables

export type InferVariableName<
  Variables extends
    | readonly ClarityAbiVariable[]
    | readonly unknown[] = readonly ClarityAbiVariable[],
  VariableName extends string | undefined = string,
> = Variables extends readonly ClarityAbiVariable[]
  ? Variables[number]['name'] extends infer VariableNames
    ?
        | VariableNames
        | (VariableName extends VariableNames ? VariableName : never)
        | (ClarityAbiVariable[] extends Variables ? string : never)
    : never
  : VariableName;

export type InferVariableType<
  Variables extends
    | readonly ClarityAbiVariable[]
    | readonly unknown[] = readonly ClarityAbiVariable[],
  VariableName extends string = string,
  TVariable extends
    ClarityAbiVariable = Variables extends readonly ClarityAbiVariable[]
    ? GetVariableByName<Variables, VariableName>
    : ClarityAbiVariable,
  TValue = InferClarityAbiType<TVariable['type']>,
> = [TValue] extends [never] ? unknown : TValue;

export type InferReadVariableParameterType<
  Variables extends
    | readonly ClarityAbiVariable[]
    | readonly unknown[] = readonly ClarityAbiVariable[],
  VariableName extends string = string,
> = {
  abi: Variables;
  variableName: InferVariableName<Variables, VariableName>;
};

export function makeFunctionArgs<
  Functions extends readonly ClarityAbiFunction[] | readonly unknown[],
  FunctionName extends string,
>(params: InferCallParameterType<Functions, FunctionName>): ClarityValue[] {
  const args: ClarityValue[] = [];
  const functionDef = (params.abi as readonly ClarityAbiFunction[]).find(
    (def) => def.name === params.functionName,
  );
  assert(
    functionDef != null,
    `failed to find function definition for ${params.functionName}`,
  );
  const argsKV = (params as unknown as { args: Record<string, unknown> }).args;
  for (const argDef of functionDef.args) {
    args.push(encodeAbi(argDef.type, argsKV[argDef.name]));
  }
  return args;
}
