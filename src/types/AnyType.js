import BaseType from './BaseType';
import {isFunction} from '../helpers';

export default class AnyType extends BaseType {
	/**
	 * @param {{}} target
	 * @param {string} name
	 * @param {*} value
	 */
	getSetterValue(target, name, value) {
		const defaultValue = this.getDefaultValue();
		const customValidator = this.getCustomValidator();

		let returnValue = value;

		if (value === undefined) {
			value = defaultValue;
		}

		if (isFunction(customValidator)) {
			customValidator.call(null, {value: returnValue, originalValue: value, name, target});
		}

		return value;
	}
}
