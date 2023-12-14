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
} from 'clarity-abi';

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
  Functions extends
    | readonly ClarityAbiFunction[]
    | readonly unknown[] = readonly ClarityAbiFunction[],
  FunctionName extends string = string,
  V extends ClarityAbiFunction['access'] = 'read_only' | 'public',
  TFunction extends
    ClarityAbiFunction = Functions extends readonly ClarityAbiFunction[]
    ? GetFunctionByName<Functions, FunctionName, V>
    : ClarityAbiFunction,
  TArgs = InferClarityAbiTypeTuple<TFunction['args']>,
> = [TArgs] extends [never]
  ? { args?: unknown }
  : {} extends TArgs
    ? {}
    : { args: TArgs };

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
} & InferFunctionArgsType<Functions, FunctionName, 'read_only'>;

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
