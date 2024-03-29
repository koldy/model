import BaseType from './BaseType';
import {isBool, isFunction, isObject, typeName} from '../helpers';

export default class BooleanType extends BaseType {
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

		if (defaultValue !== null && !isBool(defaultValue)) {
			throw new TypeError(`Property "${name}" should have boolean for its default value, got ${typeof defaultValue}`);
		}

		if (isBool(value)) {
			if (isFunction(customValidator)) {
				customValidator.call(null, {value: value, originalValue: value, name, target});
			}

			return value;
		}

		if (value === undefined) {
			if (defaultValue === null && !this._acceptsNull) {
				throw new TypeError(
					`Property "${name}" has null for its default value, but it doesn't accept null. Either set "${name}" in create() to be boolean or set its default value`
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
				throw new TypeError(`Property "${name}" should be boolean and never null`);
			}

			return null;
		}

		if (typeof value !== 'function' && isObject(value)) {
			throw new TypeError(`Expecting "${name}" to be boolean, got object`);
		}

		if (typeof value === 'string') {
			if (value.length === 0) {
				if (this._acceptsNull) {
					return null;
				} else {
					throw new TypeError(`Can not assign empty string to non-nullable BooleanType property "${name}"`);
				}
			} else {
				if (value.toLowerCase() === 'true') {
					return true;
				}

				if (value.toLowerCase() === 'false') {
					return false;
				}
			}
		}

		throw new TypeError(`Expecting "${name}" to be boolean, got ${typeName(value)}`);
	}
}
