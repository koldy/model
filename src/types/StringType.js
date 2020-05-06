import BaseType from './BaseType';
import {isArray, isFunction, isObject} from '../helpers';

export default class StringType extends BaseType {
	/**
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {string|*}
	 */
	getSetterValue(target, name, value) {
		// anything given here should be somehow converted to string, otherwise, it should fail
		let returnValue = value;

		if (typeof value === 'string') {
			if (value.length === 0) {
				return this._acceptsNull ? null : '';
			}

			returnValue = value;
		}

		if (typeof value === 'number') {
			returnValue = value.toString();
		}

		if (value === undefined) {
			returnValue = this.getDefaultValue();

			if (returnValue === null) {
				returnValue = this._acceptsNull ? null : '';
			}
		}

		if (returnValue === null) {
			returnValue = this._acceptsNull ? null : '';
		}

		if (isArray(value)) {
			throw new TypeError(`Expecting ${name} to be String, got array`);
		}

		if (isObject(value)) {
			throw new TypeError(`Expecting ${name} to be String, got object`);
		}

		if (['boolean', 'symbol', 'function', 'bigint'].indexOf(typeof value) >= 0) {
			throw new TypeError(`Expecting ${name} to be String, got ${typeof value}`);
		}

		const customValidator = this.getCustomValidator();

		if (isFunction(customValidator)) {
			customValidator.call(null, {value: returnValue, originalValue: value, name, target});
		}

		return returnValue;
	}
}
