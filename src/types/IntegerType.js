import BaseType from './BaseType';
import {isArray, isFunction, isObject} from '../helpers';

export default class IntegerType extends BaseType {
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
	 * @param {number} x
	 * @return {IntegerType}
	 */
	min(x) {
		if (typeof x !== 'number') {
			throw new TypeError(`Given minimum value for IntegerType is not valid number; expected number, got ${typeof x}`);
		}

		this._min = x;
		return this;
	}

	/**
	 * @param {number} x
	 * @return {IntegerType}
	 */
	max(x) {
		if (typeof x !== 'number') {
			throw new TypeError(`Given maximum value for IntegerType is not valid number; expected number, got ${typeof x}`);
		}

		this._max = x;
		return this;
	}

	/**
	 * @param {number} min
	 * @param {number} max
	 * @return {IntegerType}
	 */
	between(min, max) {
		return this.min(min).max(max);
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

		const defaultValue = this.getDefaultValue();

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
			returnValue = Number.parseInt(value, 10);

			if (Number.isNaN(returnValue)) {
				throw new TypeError(`Failed to parse string "${value}" to integer`);
			}
		}

		if (typeof returnValue === 'number') {
			// check if it's float... if is, then cast the returnValue

			if (returnValue % 1 === 0) {
				this._validate(returnValue, value, name, target);

				// it's integer
				return returnValue;
			}

			returnValue = ~~returnValue; // cut the decimals

			this._validate(returnValue, value, name, target);
			return returnValue;
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
