import BaseType from './BaseType';
import {isArray, isFunction, isObject, isValidDate} from '../helpers';

export default class DateType extends BaseType {
	/**
	 * @type {null|Date}
	 * @private
	 */
	_dateInstance = null;

	/**
	 * @param {Date|*} value
	 * @param {Date|*} originalValue
	 * @param {string} name
	 * @param {{}} target
	 * @private
	 */
	_validate(value, originalValue, name, target) {
		const customValidator = this.getCustomValidator();

		if (isFunction(customValidator)) {
			customValidator.call(null, {value: value, originalValue: originalValue, name, target});
		}
	}

	/**
	 * Sanitize given value and return new value if needed.
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {string|Date|null}
	 */
	getSetterValue(target, name, value) {
		const defaultValue = this.getDefaultValue();

		// the received and default values can be string or instance of Date and both are valid
		// strings are converted to Date

		if (value === undefined) {
			// let's see what's the default value

			if (defaultValue === null && !this._acceptsNull) {
				throw new TypeError(
					`Property "${name}" should be non-null value; either set the "${name}" in constructor or set its default value to be a string or Date`
				);
			}

			if (defaultValue === null) {
				this._validate(defaultValue, value, name, target);
				this._dateInstance = null;
				return null;
			}

			if (typeof defaultValue === 'string') {
				this._validate(defaultValue, value, name, target);
				// good, let's parse it
				const d = new Date(Date.parse(defaultValue));

				if (!isValidDate(d)) {
					throw new TypeError(`Unable to parse default value "${defaultValue}" for property "${name}"`);
				}

				this._dateInstance = d;
				return d;
			}

			if (defaultValue instanceof Date) {
				if (isValidDate(defaultValue)) {
					const returnValue = new Date(defaultValue);
					this._validate(returnValue, value, name, target);
					this._dateInstance = returnValue;
					return returnValue;
				} else {
					throw new TypeError(`Can't assign default value to property "${name}" because it has invalid instance of Date`);
				}
			}

			throw new TypeError(`Invalid default value for property "${name}", expected string or Date, got ${typeof defaultValue}`);
		}

		// now we have aa value that was really set in one way or another

		if (value === null) {
			if (!this._acceptsNull) {
				throw new TypeError(`Property "${name}" doesn't accept null for its value`);
			}

			this._validate(null, value, name, target);
			this._dateInstance = null;
			return null;
		}

		// is it instanceof of Date?
		if (value instanceof Date) {
			if (!isValidDate(value)) {
				throw new TypeError(`Property "${name}" got invalid instance of Date`);
			}

			this._validate(value, value, name, target);
			this._dateInstance = new Date(value);
			return value;
		}

		if (typeof value === 'string') {
			this._validate(value, value, name, target);

			// good, let's parse it
			const d = new Date(Date.parse(value));

			if (!isValidDate(d)) {
				throw new TypeError(`Unable to parse value "${value}" for property "${name}"`);
			}

			this._dateInstance = d;
			return d;
		}

		if (isObject(value)) {
			throw new TypeError(`Expecting "${name}" to be string or Date, got object`);
		}

		if (isArray(value)) {
			throw new TypeError(`Expecting "${name}" to be string or Date, got array`);
		}

		if (['symbol', 'function', 'number', 'bigint', 'boolean'].indexOf(typeof value) >= 0) {
			throw new TypeError(`Expecting "${name}" to be string or Date, got ${typeof value}`);
		}
	}

	/**
	 * @param {{}} target
	 * @param {string} name
	 * @param {string|Date|null} value
	 * @return {*}
	 */
	getGetterValue(target, name, value) {
		if (this._dateInstance instanceof Date) {
			return this._dateInstance;
		}

		return super.getGetterValue(target, name, value);
	}
}
