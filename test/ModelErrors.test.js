import Model from '../src/Model';
import StringType from '../src/types/StringType';

class Scenario1 extends Model {
	definition() {
		return {
			firstName: new StringType(),
			getData: new StringType()
		};
	};
}

class Scenario2 extends Model {
	definition() {
		return {
			_firstName: new StringType()
		};
	};
}

class Scenario3 extends Model {
	definition() {
		return {
			'': new StringType()
		};
	};
}

class Scenario4 extends Model {
	definition() {
		return {
			' ': new StringType(),
			'  ': new StringType()
		};
	};
}

class Scenario5 extends Model {
	definition() {
		return {
			'  _': new StringType()
		};
	};
}

class Scenario6 extends Model {
	definition() {
		return {
			'x_ ': new StringType()
		};
	};
}

class Scenario7 extends Model {}

class Scenario8 extends Model {
	definition() {
		return () => {};
	}
}

class Scenario9 extends Model {
	definition() {
		return {
			count: () => {}
		};
	}
}

describe('Testing Model definition errors', () => {
	it(`Throw error on method redeclaration`, () => {
		expect(() => Scenario1.create()).toThrowError('Can not redeclare property "getData" because there is a method with the same name in Scenario1 model');
	});

	it(`Throw error if property's name start with underscore`, () => {
		expect(() => Scenario2.create()).toThrowError('Can not declare property "_firstName" in Scenario2 model because it starts with underscore which is forbidden');
	});

	it(`Throw error if property's name is empty string`, () => {
		expect(() => Scenario3.create()).toThrowError('There is a property in Scenario3 model on position 1 without a name (empty string)');
	});

	it(`Throw error if property's name is string with spaces`, () => {
		expect(() => Scenario4.create()).toThrowError('Can not declare property " " in Scenario4 model because it contains one or more spaces');
	});

	it(`Throw error if property's name is string with spaces and has underscore`, () => {
		expect(() => Scenario5.create()).toThrowError('Can not declare property "  _" in Scenario5 model because it contains one or more spaces');
	});

	it(`Throw error if property's name is string with spaces and has underscore`, () => {
		expect(() => Scenario6.create()).toThrowError('Can not declare property "x_ " in Scenario6 model because it contains one or more spaces');
	});

	it(`Throw error if class model has no definition method overridden`, () => {
		expect(() => Scenario7.create()).toThrowError('Scenario7 definition() method must return object, got null instead; definition() method is probably not defined');
	});

	it(`Throw error if class model definition returns non-object`, () => {
		expect(() => Scenario8.create()).toThrowError('Scenario8 definition() method must return valid object, got function instead');
	});

	it(`Throw error if class model definition returns standard function for definition`, () => {
		expect(() => Scenario9.create()).toThrowError('Functions are not supported as type definition');
	});
});
