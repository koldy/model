import BaseType from './BaseType';
import {isFunction, isObject, typeName} from '../helpers';

export default class ObjectType extends BaseType {
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
		const defaultValue = this.getDefaultValue();

		if (defaultValue !== null && !isObject(defaultValue)) {
			throw new TypeError(`Default value in ${this.constructor.name} must be type of object, got ${typeof this._defaultValue}`);
		}

		if (isObject(value)) {
			this._validate(value, value, name, target);
			return value;
		}

		if (value === undefined) {
			if (defaultValue === null && !this._acceptsNull) {
				return {};
			}

			try {
				this._validate(defaultValue, value, name, target);
			} catch (e) {
				throw new TypeError(`Default value error: ${e.message}`);
			}

			return defaultValue;
		}

		if (value === null) {
			// if it's not nullable, then it's not acceptable

			if (!this._acceptsNull) {
				return {};
			}

			return null;
		}

		throw new TypeError(`Expecting "${name}" to be object, got ${typeName(value)}`);
	}
}
