declare module 'koldy-model' {
  type DefinitionType = {[p: string]: typeof AnyType | typeof ArrayType | typeof BooleanType | typeof DateType | typeof FloatType | typeof IntegerType | typeof ObjectType | typeof StringType};

  export class Model<T extends object> {
    static create<X extends object>(initialData?: Partial<X>, def?: DefinitionType): X extends typeof Model;
    // definition(): {[p in keyof T]: typeof AnyType | typeof ArrayType | typeof BooleanType | typeof DateType | typeof FloatType | typeof IntegerType | typeof ObjectType | typeof StringType};
    definition(): {[p in keyof T]: AnyType | ArrayType | BooleanType | DateType | FloatType | IntegerType | ObjectType | StringType};
    getDefinitions(): {[p in keyof T]: AnyType | ArrayType | BooleanType | DateType | FloatType | IntegerType | ObjectType | StringType};
    getData(): {[p in keyof T]: any};
    setData(data?: {[p in keyof T]: any}): void;
    toJSON(): {[p in keyof T]: any};
    get(name: keyof T): any;
    set(name: keyof T, value: any): void;
    keys(): keyof T[];
    values(): any[];
    hasProperty(name: keyof T): boolean;
    seal(): void;
    isSealed(): boolean;
    freeze(): void;
    isFrozen(): boolean;
    clone(): this;
  }

  export class List<M extends object> {
    // static create(elements?: Array<{[p: string]: any} | Model>, definition?: Model | AnyType | ArrayType | BooleanType | DateType | FloatType | IntegerType | ObjectType | StringType);
    static of(definition?: DefinitionType);
    displayName(): string;
    definition(): Model<M>;
    toJSON(): M[];
    getData(): M[];
    toArray(): M[];
    setData(elements: M[]): void;
    get(index: number): M | null;
    set(index: number, value: M): void;
    reset(): void;
    count(): number;
    clone(): this;
    mapEvery(n: number, fn: (element: M, i: number) => any, thisArg?: object): M[];
    forEvery(n: number, fn: (element: M, i: number) => void, thisArg?: object);
    entries(): IterableIterator<M>;
    every(fn: (value: M, index: number, array: M[]) => boolean, thisArg?: object): boolean;
    filter(fn: (value: M, index: number, array: M[]) => boolean, thisArg?: object): M[];
    find(fn: (value: M, index: number, array: M[]) => boolean, thisArg?: object): M | undefined;
    findIndex(fn: (value: M, index: number, array: M[]) => boolean, thisArg?: object): number | -1;
    forEach(fn: (value: M, index: number, array: M[]) => boolean, thisArg?: object): void;
    includes(searchElement: M, fromIndex?: number): boolean;
    indexOf(searchElement: M, fromIndex?: number): number | -1;
    join(separator?: string): string;
    keys(): IterableIterator<number>;
    lastIndexOf(searchElement: M, fromIndex?: number): number | -1;
    map(fn: (value: M, index: number, array: M[]) => boolean, thisArg?: object): M[];
    pop(): M;
    push(element: M | {[p: string]: any}): void;
    reduce(fn: (accumulator: any, currentValue: M, index: number, array: M[]) => void, initialValue: any): any;
    reduceRight(fn: (accumulator: any, currentValue: M, index: number, array: M[]) => void, initialValue: any): any;
    reverse(): M[];
    shift(): M;
    slice(start?: number, end?: number): M[];
    some(fn: (value: M, index: number, array: M[]) => boolean, thisArg?: object): boolean;
    sort(compareFn: (a: M, b: M) => number): M[];
    splice(start: number, deleteCount: number, ...items: M[]): M[];
    toLocaleString(locales: string, options: {[p: string]: any}): string;
    toString(): string;
    unshift(...items: M[]): number;
    values(): IterableIterator<M>;
  }

  class BaseType {
    displayName(): string;
    notNull(notNull?: boolean): this;
  }

  class AnyType extends BaseType {
    constructor(defaultValue?: any);
    withCustomValidator(fn: (obj: {value?: any; originalValue?: any; name: string; target: AnyType}) => void): this;
  }

  class ArrayType extends BaseType {
    constructor(defaultValue?: Array<any>);
    withCustomValidator(fn: (obj: {value?: Array<any>; originalValue?: Array<any>; name: string; target: ArrayType}) => void): this;
  }

  class BooleanType extends BaseType {
    constructor(defaultValue?: boolean);
    withCustomValidator(fn: (obj: {value?: boolean; originalValue?: boolean; name: string; target: BooleanType}) => void): this;
  }

  class DateType extends BaseType {
    constructor(defaultValue?: Date);
    withCustomValidator(fn: (obj: {value?: Date; originalValue?: Date; name: string; target: DateType}) => void): this;
  }

  class FloatType extends BaseType {
    constructor(defaultValue?: number);
    withCustomValidator(fn: (obj: {value?: number; originalValue?: number; name: string; target: FloatType}) => void): this;
    min(x: number): this;
    max(x: number): this;
    between(x: number, y: number): this;
    decimals(digits: number): this;
  }

  class IntegerType extends BaseType {
    constructor(defaultValue?: number);
    withCustomValidator(fn: (obj: {value?: number; originalValue?: number; name: string; target: IntegerType}) => void): this;
    min(x: number): this;
    max(x: number): this;
    between(x: number, y: number): this;
  }

  class ObjectType extends BaseType {
    constructor(defaultValue?: {[p: string]: any});
    withCustomValidator(
      fn: (obj: {value?: {[p: string]: any}; originalValue?: {[p: string]: any}; name: string; target: ObjectType}) => void
    ): this;
  }

  class StringType extends BaseType {
    constructor(defaultValue?: string | number);
    withCustomValidator(fn: (obj: {value?: string; originalValue?: string | number; name: string; target: StringType}) => void): this;
  }
}
