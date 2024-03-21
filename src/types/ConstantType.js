import BaseType from './BaseType';

export default class ConstantType extends BaseType {
	/**
	 * @param {*} defaultValue
	 */
	constructor(defaultValue) {
		super();

		if (defaultValue === undefined) {
			throw new TypeError(`ConstantType expects a default value in its constructor`);
		}

		this._defaultValue = defaultValue;
	}

	/**
	 * @param {object} target
	 * @param {string} name
	 * @param {*} value
	 * @return {string|*}
	 */
	getSetterValue(target, name, value) {
		const defaultValue = this.getDefaultValue();

		if (value !== defaultValue) {
			// because constants are set as default values and they can't be changed any more
			throw new TypeError(`Property "${name}" is a constant and its value can't be changed`);
		}

		return value;
	}
}
