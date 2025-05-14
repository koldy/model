import {isFunction, isObject} from './helpers';
import BaseType from './types/BaseType';
import ConstantType from './types/ConstantType';
import List from './List';

export default class Model {
	/**
	 * Array of all keys from definition
	 * @type {string[]}
	 * @private
	 */
	_keys = [];

	/**
	 * Map of all initialized definitions
	 * @type {{}}
	 * @private
	 */
	_definitions = {};

	/**
	 * @param {{}} initialData
	 */
	constructor(initialData = null) {
		const data = isObject(initialData) ? initialData : {};

		if (isObject(data) && typeof data.__KOLDY_MODEL_USE_ONLY__ === 'boolean' && data.__KOLDY_MODEL_USE_ONLY__ === true) {
			// it's fine
		} else {
			throw new Error(
				`Use ${this.constructor.name}.create() to create the instance of ${this.constructor.name} model, don\'t use "new ${this.constructor.name}()"`
			);
		}
	}

	/**
	 * @param {{}|null|undefined} initialData
	 * @param {{}|null} def
	 * @return {this}
	 */
	static create(initialData = null, def = null) {
		const self = new this({__KOLDY_MODEL_USE_ONLY__: true});
		const givenData = isObject(initialData) ? initialData : {};

		self._definitions = def || self.definition();

		if (!isObject(self._definitions)) {
			if (self._definitions === null) {
				throw new TypeError(
					`${self.displayName()} definition() method must return object, got null instead; definition() method is probably not defined`
				);
			}

			throw new TypeError(`${self.displayName()} definition() method must return valid object, got ${typeof self._definitions} instead`);
		}

		self._keys = [];

		Object.keys(self._definitions).forEach((field, position) => {
			self._keys.push(field);
			const definition = self._definitions[field];

			if (isFunction(definition)) {
				if (givenData[field] instanceof definition) {
					self[field] = givenData[field];
				} else {
					if (typeof definition.create !== 'function') {
						throw new TypeError(
							`${self.displayName()}.definition() method returned an object with property "${field}" that's not a valid definition type`
						);
					}

					// if this is a function, let's try to initialize it and the check it if its instance of model... if not, then we'll throw an error
					// try to create; this will throw an exception if possible
					let propInstance = definition.create(givenData[field]);

					if (!(propInstance instanceof Model) && !(propInstance instanceof List)) {
						throw new TypeError('Functions are not supported as type definition');
					}

					self[field] = propInstance;
				}
			} else if (isObject(definition) && !(definition instanceof BaseType)) {
				// we will treat this object as property's definition
				self[field] = Model.create(isObject(givenData[field]) ? givenData[field] : {}, definition);
				self[field].seal();
			} else {
				if (typeof field !== 'string') {
					throw new TypeError(`Expected string for definition name, got ${typeof field} instead`);
				}

				if (field.length === 0) {
					throw new TypeError(
						`There is a property in ${self.displayName()} model on position ${position + 1} without a name (empty string)`
					);
				}

				if (isFunction(self[field])) {
					throw new TypeError(
						`Can not redeclare property "${field}" because there is a method with the same name in ${self.displayName()} model`
					);
				}

				if (field.indexOf(' ') >= 0) {
					throw new TypeError(`Can not declare property "${field}" in ${self.displayName()} model because it contains one or more spaces`);
				}

				// check if property starts with underline
				if (['_keys', '_definition'].indexOf(field) >= 0) {
					throw new TypeError(
						`Can not declare property "${field}" in ${self.displayName()} model because it is forbidden to be used with Koldy Model`
					);
				}

				// handle default value

				if (definition instanceof ConstantType) {
					self[field] =
						givenData[field] === undefined ? definition.getDefaultValue() : definition.getSetterValue(self, field, givenData[field]);
				} else {
					self[field] = definition.getSetterValue(self, field, givenData[field]);
					// throw new TypeError(`Unable to use definition for field "${field}", expected instance of BaseType or Function/class that extends Model/List, got ${typeof definition}`);
				}
			}
		});

		const handler = {
			set: (target, prop, value) => {
				if (target._keys.indexOf(prop) === -1) {
					throw new TypeError(`Can not assign ${typeof value} to ${prop} because it's not defined in ${target.displayName()} model`);
				}

				const definition = target._definitions[prop];

				if (isObject(target[prop]) && (target[prop] instanceof Model || target[prop] instanceof List)) {
					target[prop].setData(value);
					return true;
				}

				if (!(definition instanceof BaseType)) {
					throw new Error(`Definition for ${prop} is not instance of BaseType`);
				}

				const newValue = definition.getSetterValue(target, prop, value);
				target[prop] = newValue === undefined ? definition.getDefaultValue() : newValue;
				return true;
			},

			get: (target, prop) => {
				const definition = target._definitions[prop];

				if (typeof target[prop] === 'function') {
					return target[prop].bind(target);
				}

				if (isObject(target[prop]) && (target[prop] instanceof Model || target[prop] instanceof List)) {
					return target[prop];
				}

				if (!(definition instanceof BaseType)) {
					throw new TypeError(`Can not get ${prop} because it's not defined in ${target.displayName()} model`);
				}

				return definition.getGetterValue(target, prop, target[prop]);
			}
		};

		return new Proxy(self, handler);
	}

	/**
	 * Should get the name of the class instance
	 * @return {string}
	 */
	displayName() {
		return this.constructor.name;
	}

	/**
	 * Sets the definition
	 * @return {{}|null}
	 */
	definition() {
		return null;
	}

	/**
	 * Gets the initialized definitions
	 *
	 * @return {{}}
	 */
	getDefinitions() {
		return this._definitions;
	}

	/**
	 * @return {{}}
	 */
	getData() {
		const data = {};
		this._keys.forEach((field) => {
			const val = this.get(field);
			if (isObject(val) && (val instanceof Model || val instanceof List)) {
				data[field] = val.getData();
			} else {
				data[field] = this._definitions[field].getDataValue(this, field, val);
			}
		});
		return data;
	}

	/**
	 * Sets the data in the model
	 *
	 * @param {object} data
	 */
	setData(data = {}) {
		let givenData;
		if (data === null || data === undefined) {
			// if passed data is null or undefined, then reinitialize the empty structure as empty object if possible
			givenData = this.constructor.create({}).getData();
		} else {
			givenData = data;
		}

		if (!isObject(givenData)) {
			throw new TypeError(`${this.displayName()}.setData() expects object as parameter, got ${typeof givenData}`);
		}

		Object.keys(givenData).forEach((key) => {
			if (this._keys.indexOf(key) >= 0) {
				// ^^ accept only keys from definition, ignore all the others

				const oldValue = this.get(key);

				if (isObject(oldValue) && (oldValue instanceof Model || oldValue instanceof List)) {
					if (oldValue instanceof List) {
						this[key].setData(givenData[key]);
					} else {
						this.set(key, givenData[key]);
					}
				} else {
					this.set(key, givenData[key]);
				}
			}
		});
	}

	/**
	 * @return {{}}
	 */
	toJSON() {
		return this.getData();
	}

	/**
	 * @param {string} name
	 * @return {*}
	 */
	get(name) {
		if (typeof name !== 'string') {
			throw new TypeError(`${this.displayName()}.get() expects first parameter to be string, got ${typeof name}`);
		}

		const definition = this._definitions[name];

		if (typeof this[name] === 'function') {
			return this[name].bind(this);
		}

		if (isObject(this[name]) && (this[name] instanceof Model || this[name] instanceof List)) {
			return this[name];
		}

		if (!(definition instanceof BaseType)) {
			throw new TypeError(`Can not get ${name} because it's not defined in ${this.displayName()} model`);
		}

		return definition.getGetterValue(this, name, this[name]);
	}

	/**
	 * @param {string} name
	 * @param {*} value
	 */
	set(name, value) {
		if (typeof name !== 'string') {
			throw new TypeError(`${this.displayName()}.set() expects first parameter to be string, got ${typeof name}`);
		}

		if (this._keys.indexOf(name) === -1) {
			throw new TypeError(`Can not assign ${typeof value} to ${name} because it's not defined in ${this.displayName()} model`);
		}

		const definition = this._definitions[name];

		if (isObject(this[name]) && (this[name] instanceof Model || this[name] instanceof List)) {
			this[name].setData(value);
			return true;
		}

		if (!(definition instanceof BaseType)) {
			throw new Error(`Definition for ${name} is not instance of BaseType`);
		}

		const newValue = definition.getSetterValue(this, name, value);
		this[name] = newValue === undefined ? definition.getDefaultValue() : newValue;
	}

	/**
	 * Get all object keys
	 * @return {string[]}
	 */
	keys() {
		return this._keys;
	}

	/**
	 * @return {*[]}
	 */
	values() {
		return Object.values(this.getData());
	}

	/**
	 * @param {string} name
	 * @return {boolean}
	 */
	hasProperty(name) {
		if (typeof name !== 'string') {
			throw new TypeError(`${this.displayName()}.hasProperty() expects first parameter to be string, got ${typeof name}`);
		}

		return this._keys.indexOf(name) >= 0;
	}

	/**
	 * Seal the object (prevent adding new properties)
	 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal
	 */
	seal() {
		Object.seal(this);
	}

	/**
	 * Returns true if object is sealed, false otherwise.
	 * @return {boolean}
	 */
	isSealed() {
		return Object.isSealed(this);
	}

	/**
	 * Freezes the object (prevents its properties from being modified).
	 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
	 */
	freeze() {
		Object.freeze(this);
	}

	/**
	 * Returns true if object is frozen.
	 * @return {boolean}
	 */
	isFrozen() {
		return Object.isFrozen(this);
	}

	/**
	 * Clones this model to new instance with data from this model.
	 * @return {Model}
	 */
	clone() {
		return this.constructor.create(this.getData());
	}
}
