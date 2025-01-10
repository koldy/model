declare module "koldy-model" {
  type DefinitionType = {
    [p: string]:
      AnyType
      | ArrayType
      | BooleanType
      | DateType
      | FloatType
      | IntegerType
      | ObjectType
      | StringType
      | ConstantType
      | typeof Model
      | typeof List<Model>
      | { [p: string]: any }
  };

	export class Model {
		static create<X extends Model>(initialData?: Partial<X>, def?: DefinitionType): X;
		definition(): DefinitionType;
		getDefinitions(): DefinitionType;
		getData(): {[p in keyof this]: any};
		setData(data?: Partial<{[p in keyof this]: any}>): void;
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
		static create<L extends List<X>, X extends Model>(elements?: Partial<X>[], definition?: Model | AnyType | ArrayType | BooleanType | DateType | FloatType | IntegerType | ObjectType | StringType | ConstantType): L;
		static of<M>(definition?: DefinitionType): List<M>;
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
		// gives ability to parse/modify received data before it's being added to the list
		protected _parse(data: any): M;
	}

	class BaseType {
		displayName(): string;
		notNull(notNull?: boolean): this;
	}

  export type AnyTypeDefaultValueFunction = () => any;

	class AnyType extends BaseType {
		constructor(defaultValue?: any | AnyTypeDefaultValueFunction);
		withCustomValidator(fn: (obj: {value?: any; originalValue?: any; name: string; target: AnyType}) => void): this;
		withCustomGetter(fn: (obj: {value?: any; name: string; target: AnyType}) => any): this;
	}

  export type ArrayTypeDefaultValueFunction = () => Array<any>;

	class ArrayType extends BaseType {
		constructor(defaultValue?: Array<any> | ArrayTypeDefaultValueFunction);
		withCustomValidator(fn: (obj: {value?: Array<any>; originalValue?: Array<any>; name: string; target: ArrayType}) => void): this;
    withCustomGetter(fn: (obj: {value?: Array<any>; name: string; target: ArrayType}) => any): this;
	}

  export type BooleanTypeDefaultValueFunction = () => boolean;

	class BooleanType extends BaseType {
		constructor(defaultValue?: boolean | BooleanTypeDefaultValueFunction);
		withCustomValidator(fn: (obj: {value?: boolean; originalValue?: boolean; name: string; target: BooleanType}) => void): this;
    withCustomGetter(fn: (obj: {value?: boolean; name: string; target: BooleanType}) => any): this;
	}

  export type DateTypeDefaultValueFunction = () => Date;

	class DateType extends BaseType {
		constructor(defaultValue?: Date | DateTypeDefaultValueFunction);
		withCustomValidator(fn: (obj: {value?: Date; originalValue?: Date; name: string; target: DateType}) => void): this;
    withCustomGetter(fn: (obj: {value?: Date; name: string; target: DateType}) => any): this;
	}

  export type FloatTypeDefaultValueFunction = () => number;

	class FloatType extends BaseType {
		constructor(defaultValue?: number | FloatTypeDefaultValueFunction);
		withCustomValidator(fn: (obj: {value?: number; originalValue?: number; name: string; target: FloatType}) => void): this;
		min(x: number): this;
		max(x: number): this;
		between(x: number, y: number): this;
		decimals(digits: number): this;
    withCustomGetter(fn: (obj: {value?: number; name: string; target: FloatType}) => any): this;
	}

  export type IntegerTypeDefaultValueFunction = () => number;

	class IntegerType extends BaseType {
		constructor(defaultValue?: number | IntegerTypeDefaultValueFunction);
		withCustomValidator(fn: (obj: {value?: number; originalValue?: number; name: string; target: IntegerType}) => void): this;
		min(x: number): this;
		max(x: number): this;
		between(x: number, y: number): this;
    withCustomGetter(fn: (obj: {value?: number; name: string; target: IntegerType}) => any): this;
	}

  export type ObjectTypeDefaultValueFunction = () => {[p: string]: any};

	class ObjectType extends BaseType {
		constructor(defaultValue?: {[p: string]: any} | ObjectTypeDefaultValueFunction);
		withCustomValidator(
			fn: (obj: {value?: {[p: string]: any}; originalValue?: {[p: string]: any}; name: string; target: ObjectType}) => void
		): this;
    withCustomGetter(fn: (obj: {value?: {[p: string]: any}; name: string; target: ObjectType}) => any): this;
	}

  export type StringTypeDefaultValueFunction = () => string | number;

	class StringType extends BaseType {
		constructor(defaultValue?: string | number | StringTypeDefaultValueFunction);
		withCustomValidator(fn: (obj: {value?: string; originalValue?: string | number; name: string; target: StringType}) => void): this;
    withCustomGetter(fn: (obj: {value?: string; name: string; target: StringType}) => any): this;
	}

  export type ConstantTypeDefaultValueFunction<T = string | number | object | boolean | null> = () => T;

  class ConstantType<T = string | number | object | boolean | null> extends BaseType {
    constructor(defaultValue?: T | ConstantTypeDefaultValueFunction<T>);
    withCustomValidator(fn: (obj: {value?: T; originalValue?: T; name: string; target: ConstantType<T>}) => void): this;
    withCustomGetter(fn: (obj: {value: T | null; name: string; target: ConstantType<T>}) => any): this;
  }
}
