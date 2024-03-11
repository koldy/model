import {isFunction} from '../helpers';

export default class BaseType {
	/**
	 * The default value
	 *
	 * @type {null|*}
	 * @public
	 */
	_defaultValue = null;

	/**
	 * Does it accept null or not
	 * @type {boolean}
	 * @public
	 */
	_acceptsNull = true;

	/**
	 * Validator function which can be set by the user to perform custom data validation
	 *
	 * @type {null|function}
	 * @private
	 */
	_validator = null;

	/**
	 * The custom getter function which can be set by the user to perform custom data transformation
	 * @type {null|function}
	 * @private
	 */
	_customGetter = null;

	/**
	 * @param {*} defaultValue
	 */
	constructor(defaultValue = undefined) {
		this._defaultValue = defaultValue === undefined ? null : defaultValue;
	}

	/**
	 * Should get the name of the class instance
	 * @return {string}
	 */
	displayName() {
		return this.constructor.name;
	}

	/**
	 * @param {boolean} notNull default true
	 * @return {this}
	 */
	notNull(notNull = true) {
		this._acceptsNull = !Boolean(notNull);
		return this;
	}

	/**
	 * @return {*}
	 */
	getDefaultValue() {
		return typeof this._defaultValue === 'function' ? this._defaultValue() : this._defaultValue;
	}

	/**
	 * Sanitize given value and return new value if needed.
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {*}
	 */
	getSetterValue(target, name, value) {
		const defaultValue = this.getDefaultValue();
		const customValidator = this.getCustomValidator();

		let returnValue = value;

		if (value === undefined || value === null) {
			if (!this._acceptsNull && defaultValue === null) {
				throw new TypeError(`Property "${name}" shouldn't be null and its default value is null which is not acceptable`);
			}

			returnValue = defaultValue === undefined ? null : defaultValue;
		}

		if (isFunction(customValidator)) {
			customValidator.call(null, {value: returnValue, originalValue: value, name, target});
		}

		return returnValue;
	}

	/**
	 * Get the property value
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {*}
	 */
	getGetterValue(target, name, value) {
    if (typeof this.getCustomGetter() === 'function') {
      return this.getCustomGetter().call(null, {value, name, target});
    }

		return value;
	}

	/**
	 * Get the "data" value
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {*}
	 */
	getDataValue(target, name, value) {
		if (value === undefined) {
			return null;
		}

		return value;
	}

	/**
	 * @param {function} fn
	 * @return {this}
	 */
	withCustomValidator(fn) {
		if (typeof fn !== 'function') {
			throw new TypeError(`Expected function for validator, got ${typeof fn}`);
		}

		this._validator = fn;
		return this;
	}

	/**
	 * @return {Function|null}
	 */
	getCustomValidator() {
		return this._validator;
	}

	/**
	 * @param fn
	 * @returns {this}
	 */
	withCustomGetter(fn) {
		if (typeof fn !== 'function') {
			throw new TypeError(`Expected function for getter, got ${typeof fn}`);
		}

		this._customGetter = fn;
		return this;
	}

	/**
	 * @return {Function|null}
	 */
	getCustomGetter() {
		return this._customGetter;
	}
}
