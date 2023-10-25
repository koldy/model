import BaseType from './BaseType';
import {isArray, isFunction, typeName} from '../helpers';

export default class ArrayType extends BaseType {
	/**
	 * Sanitize given value and return new value if needed.
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {*}
	 */
	getSetterValue(target, name, value) {
		const customValidator = this.getCustomValidator();
		const defaultValue = this.getDefaultValue();

		if (defaultValue !== null && !isArray(defaultValue)) {
			throw new TypeError(`Default value in ${this.constructor.name} must be type of array, got ${typeof this._defaultValue}`);
		}

		if (isArray(value)) {
			if (isFunction(customValidator)) {
				customValidator.call(null, {value, originalValue: value, name, target});
			}

			return value;
		}

		if (value === undefined) {
			if (defaultValue === null && !this._acceptsNull) {
				throw new TypeError(
					`Property "${name}" has null for its default value, but it doesn't accept null. Either set "${name}" to be array or set its default value`
				);
			}

			if (isFunction(customValidator)) {
				customValidator.call(null, {value: defaultValue, originalValue: value, name, target});
			}

			return defaultValue;
		}

		if (value === null) {
			// if it's not nullable, then it's not acceptable

			if (!this._acceptsNull) {
				throw new TypeError(`Property "${name}" should be array and never null`);
			}

			return null;
		}

		throw new TypeError(`Expecting "${name}" to be array, got ${typeName(value)}`);
	}
}
