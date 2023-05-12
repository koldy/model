declare module 'koldy-model' {
  type DefinitionType = {[p: string]: AnyType | ArrayType | BooleanType | DateType | FloatType | IntegerType | ObjectType | StringType | typeof Model};

  export class Model {
    static create<X extends Model>(initialData?: Partial<X>, def?: DefinitionType): X;
    definition(): DefinitionType;
    getDefinitions(): DefinitionType;
    getData(): {[p in keyof this]: any};
    setData(data?: {[p in keyof this]: any}): void;
    toJSON(): {[p in keyof this]: any};
    get(name: string): any;
    set(name: string, value: any): void;
    keys(): string[];
    values(): any[];
    hasProperty(name: string): boolean;
    seal(): void;
    isSealed(): boolean;
    freeze(): void;
    isFrozen(): boolean;
    clone(): this;
  }

  export class List<M> {
    static create<L extends List<X>, X extends Model>(elements?: Partial<X>[], definition?: Model | AnyType | ArrayType | BooleanType | DateType | FloatType | IntegerType | ObjectType | StringType): L;
    static of(definition?: DefinitionType);
    length: number;
    displayName(): string;
    definition(): typeof Model;
    toJSON(): M[];
    getData(): M[];
    toArray(): M[];
    setData(elements: M[]): void;
    get(index: number): M | null;
    set(index: number, value: M): void;
    reset(): void;
    count(): number;
    clone(): this;
    mapEvery(n: number, fn: (element?: M, i?: number) => any, thisArg?: object): any;
    forEvery(n: number, fn: (element?: M, i?: number) => void, thisArg?: object);
    entries(): IterableIterator<M>;
    every(fn: (value?: M, index?: number, array?: M[]) => boolean, thisArg?: object): boolean;
    filter(fn: (value?: M, index?: number, array?: M[]) => boolean, thisArg?: object): M[];
    find(fn: (value?: M, index?: number, array?: M[]) => boolean, thisArg?: object): M | undefined;
    findIndex(fn: (value?: M, index?: number, array?: M[]) => boolean, thisArg?: object): number | -1;
    forEach(fn: (value?: M, index?: number, array?: M[]) => void, thisArg?: object): void;
    includes(searchElement: M, fromIndex?: number): boolean;
    indexOf(searchElement: M, fromIndex?: number): number | -1;
    join(separator?: string): string;
    keys(): IterableIterator<number>;
    lastIndexOf(searchElement: M, fromIndex?: number): number | -1;
    map(fn: (value?: M, index?: number, array?: M[]) => any, thisArg?: object): any;
    pop(): M;
    push(element: M | Partial<M>): void;
    reduce(fn: (accumulator: any, currentValue: M, index: number, array: M[]) => void, initialValue: any): any;
    reduceRight(fn: (accumulator: any, currentValue: M, index: number, array: M[]) => void, initialValue: any): any;
    reverse(): M[];
    shift(): M;
    slice(start?: number, end?: number): M[];
    some(fn: (value?: M, index?: number, array?: M[]) => boolean, thisArg?: object): boolean;
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