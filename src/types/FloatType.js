import BaseType from './BaseType';
import {isArray, isFunction, isObject} from '../helpers';

export default class FloatType extends BaseType {
	/**
	 * Custom validator that will ignore any value less than this
	 * @type {number|null}
	 * @private
	 */
	_min = null;

	/**
	 * Custom validator that will ignore any value greater than this
	 * @type {number|null}
	 * @private
	 */
	_max = null;

	/**
	 * Decimal digits accepted
	 * @type {null}
	 * @private
	 */
	_decimals = null;

	/**
	 * @param {number} x
	 * @return {FloatType}
	 */
	min(x) {
		if (typeof x !== 'number') {
			throw new TypeError(`Given minimum value for FloatType is not valid number; expected number, got ${typeof x}`);
		}

		this._min = x;
		return this;
	}

	/**
	 * @param {number} x
	 * @return {FloatType}
	 */
	max(x) {
		if (typeof x !== 'number') {
			throw new TypeError(`Given maximum value for FloatType is not valid number; expected number, got ${typeof x}`);
		}

		this._max = x;
		return this;
	}

	/**
	 * @param {number} min
	 * @param {number} max
	 * @return {FloatType}
	 */
	between(min, max) {
		return this.min(min).max(max);
	}

	/**
	 * @param {number} x
	 * @return {FloatType}
	 */
	decimals(x) {
		if (typeof x !== 'number') {
			throw new TypeError(`Given decimals value for FloatType is not valid number; expected number, got ${typeof x}`);
		}

		if (x % 1 !== 0) {
			throw new TypeError(`Given decimals value for FloatType should be integer, not float; got ${x}`);
		}

		if (x < 0) {
			throw new TypeError(`Given decimals value for FloatType should be positive integer; got ${x}`);
		}

		this._decimals = x;
		return this;
	}

	/**
	 * Sanitize input by checking it through string type, then return number
	 * @param {number|*} value
	 * @return {number}
	 * @private
	 */
	_sanitizeValue(value) {
		if (typeof value !== 'number') {
			return value;
		}

		const str = value.toString();

		if (this._decimals !== null && str.indexOf('.') >= 0) {
			const tmp = str.split('.');
			let decimals = tmp[1];

			if (decimals.length > this._decimals) {
				decimals = decimals.substr(0, this._decimals);
			}

			return parseFloat(`${tmp[0]}.${decimals}`);
		}

		return value;
	}

	/**
	 * Validate given values
	 *
	 * @param {number} value
	 * @param {number} originalValue
	 * @param {string} name
	 * @param {object} target
	 * @private
	 */
	_validate(value, originalValue, name, target) {
		if (this._min !== null && value < this._min) {
			throw new TypeError(`${this._min} is minimum value allowed for "${name}", got ${value}`);
		}

		if (this._max !== null && value > this._max) {
			throw new TypeError(`${this._max} is maximum value allowed for "${name}", got ${value}`);
		}

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
	 * @return {*}
	 */
	getSetterValue(target, name, value) {
		let returnValue = value;

		const defaultValue = this._sanitizeValue(this.getDefaultValue());

		if (returnValue === undefined) {
			// check its default value
			if (defaultValue === null && !this._acceptsNull) {
				throw new TypeError(`Property "${name}" shouldn't be null and its default value is null which is not acceptable`);
			}

			try {
				this._validate(defaultValue, value, name, target);
			} catch (e) {
				throw new TypeError(`Default value error: ${e.message}`);
			}

			return defaultValue;
		}

		if (returnValue === null && !this._acceptsNull) {
			if (defaultValue === null) {
				throw new TypeError(`Property "${name}" shouldn't be null and its default value is null which is not acceptable`);
			}

			throw new TypeError(`Expecting "${name}" not to be null`);
		}

		if (typeof value === 'string') {
			if (value.length === 0) {
				// it's an empty string
				if (this._acceptsNull) {
					return null;
				} else {
					throw new TypeError(`Can not assign empty string to non-nullable FloatType property "${name}"`);
				}
			} else {
				returnValue = Number.parseFloat(value);

				if (Number.isNaN(returnValue)) {
					throw new TypeError(`Failed to parse string "${value}" to integer`);
				}
			}
		}

		if (typeof returnValue === 'number') {
			returnValue = this._sanitizeValue(returnValue);
			this._validate(returnValue, value, name, target);
			return returnValue; // cut the decimals
		}

		if (isArray(returnValue)) {
			throw new TypeError(`Expecting "${name}" to be String, got array`);
		}

		if (isObject(returnValue)) {
			throw new TypeError(`Expecting "${name}" to be String, got object`);
		}

		if (['boolean', 'symbol', 'function', 'bigint'].indexOf(typeof returnValue) >= 0) {
			throw new TypeError(`Expecting "${name}" to be String, got ${typeof returnValue}`);
		}

		return returnValue;
	}
}
