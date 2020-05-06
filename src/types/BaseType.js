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
		return this._defaultValue;
	}

	/**
	 * Sanitize given value and return new value if needed.
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {*}
	 */
	getSetterValue(target, name, value) {
		if (value === undefined) {
			return this._defaultValue;
		}

		return value;
	}

	/**
	 * Get the property value
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {*}
	 */
	getGetterValue(target, name, value) {
		if (value === undefined) {
			return this._defaultValue;
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

}
