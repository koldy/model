import {isObject, isArray, isFunction, typeName} from './helpers';
import Model from './Model';
import BaseType from './types/BaseType';

const BASE_TYPE = 1;
const MODEL_INSTANCE = 2;
const LIST_TYPE = 3;

export default class List {
	/**
	 * @type {*[]}
	 * @private
	 */
	_list = [];

	/**
	 * @type {BaseType|function}
	 * @private
	 */
	_definition = null;

	/**
	 * @type {{type: String, def: *, name: String|null}|null}
	 * @private
	 */
	_definitionInfo = null;

	/**
	 * @param {{}} data
	 */
	constructor(data = {}) {
		this._list = [];
		if (isObject(data) && typeof data.__KOLDY_MODEL_USE_ONLY__ === 'boolean' && data.__KOLDY_MODEL_USE_ONLY__ === true) {
			// it's fine
		} else {
			throw new Error(
				`Use ${this.constructor.name}.create() to create the instance of ${this.constructor.name} model, don\'t use "new ${this.constructor.name}()"`
			);
		}
	}

	/**
	 * @param {[]} data
	 * @param {{}|null} def
	 * @return {this}
	 */
	static create(data = [], def = null) {
		const self = new this({__KOLDY_MODEL_USE_ONLY__: true});

		if (!isArray(data)) {
			// if we didn't get the array, other variation could be that the undefined or null are given
			// in that case, we will skip the undefined and null and we'll treat that as an empty array
			if (data === undefined || data === null) {
				data = [];
			} else {
				// otherwise, throw an error
				throw new TypeError(`Expected array for ${self.displayName()}.create(), got ${typeName(data)}`);
			}
		}

		self._definition = def || self.definition();
		self._getDefinitionInfo();

		// if we're here, we're good!

		self.setData(data);

		const handler = {
			set: (target, prop, value) => {
				const index = Number.parseInt(prop, 10);

				if (Number.isNaN(index)) {
					throw new Error(`${target.displayName()} doesn't allow assigning this`);
				}

				target.set(index, value);
				return true;
			},
			get: (target, prop) => {
				// Allow access to Symbol properties
				if (typeof prop === 'symbol') {
					return target[prop];
				}

				if (prop === 'length') {
					return target.count();
				}

				if (typeof target[prop] === 'function') {
					return target[prop].bind(target);
				}

				try {
					const index = Number.parseInt(prop);

					if (!Number.isNaN(index)) {
						return target.get(index);
					}
				} catch (ignored) {}

				// React internal properties - return undefined if not defined
				const reactSpecificProps = ['$$typeof', '_owner', '_store', 'key', 'ref'];
				if (reactSpecificProps.indexOf(prop) >= 0) {
					return undefined;
				}

				throw new Error(`${target.displayName()} has no property "${prop}"`);
			}
		};

		return new Proxy(self, handler);
	}

	/**
	 * Dynamically create definition of List
	 * @param {BaseType|Function} def
	 * @returns {any}
	 */
	static of(def) {
		return class extends List {
			definition() {
				return def;
			}
		};
	}

	/**
	 * Should get the name of the class instance
	 * @return {string}
	 */
	displayName() {
		return this.constructor.name;
	}

	/**
	 * @return {BaseType|function|Model}
	 */
	definition() {
		return null;
	}

	/**
	 * Get the definition info
	 * @returns {{type: Number, def: *, name: null|string}}
	 * @private
	 */
	_getDefinitionInfo() {
		if (this._definitionInfo === null) {
			const def = this._definition;

			if (def === null) {
				throw new TypeError(
					`Invalid definition in ${this.displayName()}, expected instance of BaseType or function of Model, got null; definition() method is probably not defined`
				);
			}

			if (def instanceof BaseType) {
				// this is simple case, when each array type is one of the base types
				this._definitionInfo = {
					type: BASE_TYPE,
					def,
					name: null
				};
			} else if (isFunction(def) && isFunction(def.create)) {
				// case when each element in array should be instance of this
				const model = new def({__KOLDY_MODEL_USE_ONLY__: true});
				// model can be instance of Model or List

				if (model instanceof Model) {
					const name = model.displayName();

					this._definitionInfo = {
						type: MODEL_INSTANCE,
						def,
						name
					};
				} else if (model instanceof List) {
					const name = model.displayName();

					this._definitionInfo = {
						type: LIST_TYPE,
						def,
						name
					};
				} else {
					throw new TypeError(`Invalid definition in ${this.displayName()}, expecting instance of BaseType or function of Model`);
				}
			} else {
				throw new TypeError(`Invalid definition in ${this.displayName()}, expecting instance of BaseType or function of Model`);
			}
		}

		return this._definitionInfo;
	}

	/**
	 * @return {*[]}
	 */
	toJSON() {
		return this.getData();
	}

	/**
	 * @return {*[]}
	 */
	getData() {
		return this._list;
	}

	/**
	 * @returns {*[]}
	 */
	toArray() {
		return this._list;
	}

	/**
	 * @param element
	 */
	_parse(element) {
		const {type, def, name} = this._getDefinitionInfo();

		switch (type) {
			case BASE_TYPE:
				return def.getSetterValue({}, 'list element', element);

			case MODEL_INSTANCE:
				if (element instanceof def) {
					return element;
				}

				if (isObject(element) && !(element instanceof Model)) {
					return def.create(element);
				}

				if (isObject(element) && element instanceof Model) {
					throw new TypeError(`Expected instance of "${name}", got instance of "${element.displayName()}"`);
				}

				throw new TypeError(`Expected instance of "${name}"`);

			case LIST_TYPE:
				if (element instanceof def) {
					return element;
				}

				if (isObject(element) && !(element instanceof List)) {
					return def.create(element);
				}

				if (isObject(element) && element instanceof List) {
					throw new TypeError(`Expected instance of "${name}", got instance of "${element.displayName()}"`);
				}

				throw new TypeError(`Expected instance of "${name}"`);

			// no default
		}
	}

	/**
	 * @param {*[]} data
	 */
	setData(data) {
		if (isObject(data)) {
			// it's possible that the provided value is the required instance of
			const {type, def, name} = this._getDefinitionInfo();

			switch (type) {
				case MODEL_INSTANCE:
					if (data.displayName() === this.displayName() && data.definition() === this.definition()) {
						this._list = data;
						return;
					}
					break;

				// no default
			}
		}

		if (!isArray(data)) {
			// if we didn't get the array, other variation could be that the undefined or null are given
			// in that case, we will skip the undefined and null and we'll treat that as an empty array
			if (data === undefined || data === null) {
				data = [];
			} else {
				// otherwise, throw an error
				throw new TypeError(`Expected array for ${this.displayName()}.setData(), got ${typeName(data)}`);
			}
		}

		const theList = [];

		data.forEach((element, i) => {
			theList.push(this._parse(element));
		});

		this._list = theList;
	}

	/**
	 * @param {number} index
	 */
	get(index) {
		if (typeof index !== 'number') {
			throw new TypeError(`${this.displayName()}.get() expected number for the first parameter, got ${typeName(index)}`);
		}

		if (index < 0) {
			throw new TypeError(`${this.displayName()}.get() expected zero or positive integer for first parameter`);
		}

		return typeof this._list[index] === 'undefined' ? null : this._list[index];
	}

	/**
	 * @param {number} index
	 * @param {*} value
	 */
	set(index, value) {
		if (typeof index !== 'number') {
			throw new TypeError(`${this.displayName()}.set() expected number for the first parameter, got ${typeName(index)}`);
		}

		if (index < 0) {
			throw new TypeError(`${this.displayName()}.set() expected zero or positive integer for first parameter`);
		}

		this._list[index] = this._parse(value);
	}

	/**
	 * Resets
	 */
	reset() {
		this._list = [];
	}

	/**
	 * @return {number}
	 */
	count() {
		return this._list.length;
	}

	/**
	 * @return {this.constructor}
	 */
	clone() {
		return this.constructor.create([...this._list]);
	}

	/**
	 * Same as array.map, but for every N elements
	 * @param {number} n
	 * @param {function} fn
	 * @param {object} thisArg
	 * @return {[]}
	 */
	mapEvery(n, fn, thisArg) {
		if (typeof n !== 'number') {
			throw new TypeError(`First parameter expected a number, got ${typeName(n)}`);
		}

		if (n < 1) {
			throw new TypeError(`First parameter expected a positive integer, got: ${n}`);
		}

		const x = ~~n;

		if (x !== n) {
			throw new TypeError(`First parameter expected integer, got float: ${n}`);
		}

		if (!isFunction(fn)) {
			throw new TypeError(`Second parameter expected a function, got ${typeName(fn)}`);
		}

		const results = [];

		for (let i = 0; i < this.count(); i += n) {
			results.push(fn.call(thisArg, this.get(i), i));
		}

		return results;
	}

	/**
	 * Same as "mapEvery", but returns nothing
	 * @param {number} n
	 * @param {function} fn
	 * @param {object} thisArg
	 */
	forEvery(n, fn, thisArg) {
		this.mapEvery(n, fn, thisArg);
	}

	// implementations of standard Array methods

	/**
	 * @return {IterableIterator<[number, *]>}
	 */
	entries() {
		return this._list.entries();
	}

	/**
	 * @param {function} fn
	 * @param {{}} thisArg
	 * @return {boolean}
	 */
	every(fn, thisArg) {
		return this._list.every(fn, thisArg);
	}

	/**
	 * @param {function} fn
	 * @param {{}} thisArg
	 * @return {boolean}
	 */
	filter(fn, thisArg) {
		return this._list.filter(fn, thisArg);
	}

	/**
	 * @param {function} fn
	 * @param {{}} thisArg
	 * @return {boolean}
	 */
	find(fn, thisArg) {
		return this._list.find(fn, thisArg);
	}

	/**
	 * @param {function} fn
	 * @param {{}} thisArg
	 * @return {boolean}
	 */
	findIndex(fn, thisArg) {
		return this._list.findIndex(fn, thisArg);
	}

	/**
	 * @param {function} fn
	 * @param {{}} thisArg
	 * @return {boolean}
	 */
	forEach(fn, thisArg) {
		return this._list.forEach(fn, thisArg);
	}

	/**
	 * @param valueToFind
	 * @param fromIndex
	 * @return {boolean}
	 */
	includes(valueToFind, fromIndex) {
		return this._list.includes(valueToFind, fromIndex);
	}

	/**
	 * @param valueToFind
	 * @param fromIndex
	 * @return {boolean}
	 */
	indexOf(valueToFind, fromIndex) {
		return this._list.indexOf(valueToFind, fromIndex);
	}

	/**
	 * @param {string} separator
	 * @return {string}
	 */
	join(separator) {
		return this._list.join(separator);
	}

	/**
	 * @return {IterableIterator<number>}
	 */
	keys() {
		return this._list.keys();
	}

	/**
	 * @param searchElement
	 * @param fromIndex
	 * @return {number}
	 */
	lastIndexOf(searchElement, fromIndex) {
		return this._list.lastIndexOf(searchElement, fromIndex);
	}

	/**
	 * @param {function} fn
	 * @param {{}} thisArg
	 * @return {boolean}
	 */
	map(fn, thisArg) {
		return this._list.map(fn, thisArg);
	}

	/**
	 * Removes the last element from an array and returns that element. This method changes the length of the array.
	 * @return {*}
	 */
	pop() {
		return this._list.pop();
	}

	/**
	 * Adds one or more elements to the end of an array and returns the new length of the array.
	 *
	 * @param element
	 */
	push(element) {
		this._list.push(this._parse(element));
	}

	/**
	 * @param {function} fn
	 * @param {*} initialValue
	 * @return {*}
	 */
	reduce(fn, initialValue) {
		return this._list.reduce(fn, initialValue);
	}

	/**
	 * @param {function} fn
	 * @param {*} initialValue
	 * @return {*}
	 */
	reduceRight(fn, initialValue) {
		return this._list.reduceRight(fn, initialValue);
	}

	/**
	 * @return {*[]}
	 */
	reverse() {
		return this._list.reverse();
	}

	/**
	 * Removes the first element from an array and returns that removed element. This method changes the length of the array.
	 * @return {*}
	 */
	shift() {
		return this._list.shift();
	}

	/**
	 * @param begin
	 * @param end
	 * @return {*[]}
	 */
	slice(begin, end) {
		return this._list.slice(begin, end);
	}

	/**
	 * @param {function} fn
	 * @param {*} initialValue
	 * @return {*}
	 */
	some(fn, initialValue) {
		return this._list.some(fn, initialValue);
	}

	/**
	 * @param fn
	 * @return {*[]}
	 */
	sort(fn) {
		const arr = [...this.getData()];
		arr.sort(fn);
		return arr;
	}

	/**
	 * @param start
	 * @param deleteCount
	 * @param args
	 * @return {*[]}
	 */
	splice(start, deleteCount, ...args) {
		return this._list.splice(start, deleteCount, ...args);
	}

	/**
	 * @param locales
	 * @param options
	 * @return {string}
	 */
	toLocaleString(locales, options) {
		return this._list.toLocaleString(locales, options);
	}

	/**
	 * @return {string}
	 */
	toString() {
		return this._list.toString();
	}

	/**
	 * @param args
	 * @return {number}
	 */
	unshift(...args) {
		return this._list.unshift(...args);
	}

	/**
	 * @returns {IterableIterator<*>}
	 */
	values() {
		return this._list.values();
	}
}
