import {isArray, isFunction, isObject, trim} from './helpers';
import BaseType from './types/BaseType';
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
	 * Map of initialized definitions for array subtypes; each key here is the name of a property and the value is instance of definition
	 * in the moment when value is set
	 * @type {{}}
	 * @private
	 */
	_arrayDefinitions = {};

	/**
	 * @param {{}} data
	 */
	constructor(data = {}) {
		if (isObject(data) && typeof data.__KOLDY_MODEL_USE_ONLY__ === 'boolean' && data.__KOLDY_MODEL_USE_ONLY__ === true) {
			// it's fine
		} else {
			throw new Error(
				`Use ${this.constructor.name}.create() to create the instance of ${this.constructor.name} model, don\'t use "new ${this.constructor.name}()"`
			);
		}
	}

	/**
	 * @param {{}} initialData
	 * @param {{}|null} def
	 * @return {this}
	 */
	static create(initialData = {}, def = null) {
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
				if (initialData[field] instanceof definition) {
					self[field] = initialData[field];
				} else {
					// if this is a function, let's try to initialize it and the check it if its instance of model... if not, then we'll throw an error
					let propInstance = null;

					try {
						propInstance = definition.create(initialData[field]);
					} catch (ignored) {}

					if (!(propInstance instanceof Model) && !(propInstance instanceof List)) {
						throw new TypeError('Functions are not supported as type definition');
					}

					self[field] = propInstance;
				}
			} else if (isObject(definition) && !(definition instanceof BaseType)) {
				// we will treat this object as property's definition
				self[field] = Model.create(isObject(givenData[field]) ? givenData[field] : {}, definition);
				self[field].seal();
			} else if (isArray(definition) && definition.length >= 1) {
				// if definition is array, then it should be an array of available types... so we'll go through the list
				// and we'll try to initialize value for every type; if we run out of options, then we'll throw TypeError
				// type can be value as well, like "null"

				if (self._arrayDefinitions[field]) {
					delete self._arrayDefinitions[field];
				}

				let didSucceed = false;
				let counter = 0;

				do {
					// iterate through all elements of the given definition array
					const subType = definition[counter];

					if (isFunction(subType)) {
						if (initialData[field] instanceof subType) {
							self[field] = initialData[field];
							didSucceed = true;
							// ^^ this doesn't affect _arrayDefinitions

						} else {
							try {
								// if this is a function, let's try to initialize it and the check it if its instance of model... if not, then we'll throw an error
								let propInstance = null;

								try {
									propInstance = subType.create(initialData[field]);
								} catch (ignored) {
								}

								if (!(propInstance instanceof Model) && !(propInstance instanceof List)) {
									throw new TypeError('Functions are not supported as type definition');
								}

								self[field] = propInstance;
								didSucceed = true;
								self._arrayDefinitions[field] = subType;
							} catch (ignored) {}
						}

					} else if (isObject(subType) && !(subType instanceof BaseType)) {
						try {
							// we will treat this object as property's subType's definition
							self[field] = Model.create(isObject(givenData[field]) ? givenData[field] : {}, subType);
							self[field].seal();
							didSucceed = true;
							self._arrayDefinitions[field] = subType;
						} catch (ignored) {}

					} else if (isArray(subType)) {
						throw new TypeError(`Error in definition for property "${field}": Array within the property's array of possible types is not permitted`);

					} else if (subType === null) {
						self[field] = null;
						didSucceed = true;

					} else {
						try {
							self[field] = subType.getSetterValue(self, field, givenData[field]);
							didSucceed = true;
							self._arrayDefinitions[field] = subType;
						} catch (ignored) {}

					}
				} while (!didSucceed && counter++ < definition.length);

				if (!didSucceed) {
					throw new TypeError(
						`Property ${field} in ${self.displayName()} can not be initialized due to invalid property definition or invalid value`
					);
				}

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
				if (trim(field).charAt(0) === '_') {
					throw new TypeError(
						`Can not declare property "${field}" in ${self.displayName()} model because it starts with underscore which is forbidden`
					);
				}

				// handle default value

				self[field] = definition.getSetterValue(self, field, givenData[field]);
				// throw new TypeError(`Unable to use definition for field "${field}", expected instance of BaseType or Function/class that extends Model/List, got ${typeof definition}`);
			}
		});

		const handler = {
			set: (target, prop, value) => {
				if (target._keys.indexOf(prop) === -1) {
					throw new TypeError(`Can not assign ${typeof value} to ${prop} because it's not defined in ${target.displayName()} model`);
				}

				const definition = target._definitions[prop];

				if (isArray(definition) && definition.length > 0) {
					// retry setting value with any of the definitions
					if (target._arrayDefinitions[prop]) {
						delete target._arrayDefinitions[prop];
					}

					let didSucceed = false;
					let counter = 0;

					do {
						// iterate through all elements of the given definition array
						const subType = definition[counter];

						if (isFunction(subType)) {
							if (value instanceof subType) {
								target[prop] = value;
								didSucceed = true;
								// ^^ this doesn't affect _arrayDefinitions

							} else {
								try {
									// if this is a function, let's try to initialize it and the check it if its instance of model... if not, then we'll throw an error
									let propInstance = null;

									try {
										propInstance = subType.create(value);
									} catch (ignored) {
									}

									if (!(propInstance instanceof Model) && !(propInstance instanceof List)) {
										throw new TypeError('Functions are not supported as type definition');
									}

									target[prop] = propInstance;
									didSucceed = true;
									target._arrayDefinitions[prop] = subType;
								} catch (ignored) {}
							}

						} else if (isObject(subType) && !(subType instanceof BaseType)) {
							try {
								// we will treat this object as property's subType's definition
								target[prop] = Model.create(isObject(value) ? value : {}, subType);
								target[prop].seal();
								didSucceed = true;
								target._arrayDefinitions[prop] = subType;
							} catch (ignored) {}

						} else if (isArray(subType)) {
							throw new TypeError(`Error in definition for property "${prop}": Array within the property's array of possible types is not permitted`);

						} else if (subType === null) {
							target[prop] = null;
							didSucceed = true;

						} else {
							try {
								target[prop] = subType.getSetterValue(target, prop, value);
								didSucceed = true;
								target._arrayDefinitions[prop] = subType;
							} catch (ignored) {}

						}
					} while (!didSucceed && counter++ < definition.length);

					if (!didSucceed) {
						throw new TypeError(
							`Property ${prop} in ${target.displayName()} can not be initialized due to invalid property definition or invalid value`
						);
					}

					return true;
				}

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
				const val = target[prop];
				const definition = target._definitions[prop];

				if (typeof val === 'function') {
					return val.bind(target);
				}

				if (isObject(val) && (val instanceof Model || val instanceof List)) {
					return val;
				}

				if (isArray(definition)) {
					// let's lookup for the subtype
					const subDefinition = self._arrayDefinitions[prop];

					if (subDefinition) {
						return subDefinition.getGetterValue(target, prop, val);
					}

					throw new TypeError(`Can not get ${prop} because its definition in ${target.displayName()} model is invalid`);
				}

				if (!(definition instanceof BaseType)) {
					throw new TypeError(`Can not get ${prop} because it's not defined in ${target.displayName()} model`);
				}

				return definition.getGetterValue(target, prop, val);
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
				// ^^ accept only keys from definition, ignore all other

				if (isObject(this[key]) && (this[key] instanceof Model || this[key] instanceof List)) {
					this[key].setData(givenData[key]);
				} else {
					this[key] = givenData[key];
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

		return this[name];
	}

	/**
	 * @param {string} name
	 * @param {*} value
	 */
	set(name, value) {
		if (typeof name !== 'string') {
			throw new TypeError(`${this.displayName()}.set() expects first parameter to be string, got ${typeof name}`);
		}

		this[name] = value;
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
