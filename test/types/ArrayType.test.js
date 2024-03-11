import Model from '../../src/Model';
import ArrayType from '../../src/types/ArrayType';

class Scenario1 extends Model {
	definition() {
		return {
			list: new ArrayType()
		};
	}
}

class Scenario2 extends Model {
	definition() {
		return {
			list: new ArrayType().notNull()
		};
	}
}

class Scenario3 extends Model {
	definition() {
		return {
			list: new ArrayType(5)
		};
	}
}

class Scenario4 extends Model {
	definition() {
		return {
			list: new ArrayType([5])
		};
	}
}

class Scenario5 extends Model {
	definition() {
		return {
			list: new ArrayType([5]).notNull()
		};
	}
}

class Scenario6 extends Model {
	definition() {
		return {
			list: new ArrayType([3]).notNull().withCustomValidator(function ({value}) {
				if (value.length < 3) {
					throw new TypeError('There should be at least 3 elements in array');
				}

				if (value.length > 5) {
					throw new TypeError("There shouldn't be more than 5 elements in array");
				}
			})
		};
	}
}

class Scenario7 extends Model {
	definition() {
		return {
			list: new ArrayType().withCustomGetter(function ({value}) {
        return value.length === 0 ? null : value;
      })
    }
	}
}

describe('Testing ArrayType', () => {
	it(`Testing empty instance`, () => {
		const u = Scenario1.create();
		expect(u.list).toBeNull();
	});

	it(`Testing array setters`, () => {
		const u = Scenario1.create();

		u.list = [];
		expect(u.list).toStrictEqual([]);

		u.list = null;
		expect(u.list).toBeNull();

		u.list = [1, 4, 11];
		expect(u.list).toStrictEqual([1, 4, 11]);

		u.list = undefined;
		expect(u.list).toBeNull();
	});

	it(`Testing wrong type assignment errors`, () => {
		const u = Scenario1.create();

		expect(() => (u.list = 5)).toThrowError('Expecting "list" to be array, got number');
		expect(() => (u.list = 0.12)).toThrowError('Expecting "list" to be array, got number');
		expect(() => (u.list = '5')).toThrowError('Expecting "list" to be array, got string');
		expect(() => (u.list = {})).toThrowError('Expecting "list" to be array, got object');
		expect(() => (u.list = function () {})).toThrowError('Expecting "list" to be array, got function');
	});

	it(`Testing assignment on not null`, () => {
		expect(() => Scenario2.create()).toThrowError(
			'Property "list" has null for its default value, but it doesn\'t accept null. Either set "list" to be array or set its default value'
		);

		const u = Scenario2.create({list: []});
		expect(u.list).toStrictEqual([]);
		expect(() => (u.list = null)).toThrowError('Property "list" should be array and never null');
		expect(() => (u.list = undefined)).toThrowError(
			'Property "list" has null for its default value, but it doesn\'t accept null. Either set "list" to be array or set its default value'
		);
	});

	it(`Testing invalid definition`, () => {
		expect(() => Scenario3.create()).toThrowError('Default value in ArrayType must be type of array, got number');
	});

	it(`Testing default value`, () => {
		expect(Scenario4.create().list).toStrictEqual([5]);
		expect(Scenario4.create({list: [4]}).list).toStrictEqual([4]);
		expect(Scenario4.create({list: []}).list).toStrictEqual([]);
		expect(Scenario4.create({list: null}).list).toBeNull();
		expect(Scenario4.create({list: undefined}).list).toStrictEqual([5]);
	});

	it(`Testing default value with not null`, () => {
		expect(Scenario5.create().list).toStrictEqual([5]);
		expect(Scenario5.create({list: [4]}).list).toStrictEqual([4]);
		expect(Scenario5.create({list: []}).list).toStrictEqual([]);
		expect(Scenario5.create({list: [null]}).list).toStrictEqual([null]);
		expect(() => Scenario5.create({list: null}).list).toThrowError('Property "list" should be array and never null');
		expect(Scenario5.create({list: undefined}).list).toStrictEqual([5]);
	});

	it(`Testing custom validator`, () => {
		expect(() => Scenario6.create()).toThrowError('There should be at least 3 elements in array');
		expect(() => Scenario6.create({list: [1, 2, 3, 4, 5, 6]})).toThrowError("There shouldn't be more than 5 elements in array");
		expect(Scenario6.create({list: [1, 2, 3, 4, 5]}).list).toStrictEqual([1, 2, 3, 4, 5]);
	});

	it(`Testing with custom getter`, () => {
    const u = Scenario7.create({list: []});
    expect(u.list).toBeNull();
    u.list = [1, 2, 3];
    expect(u.list).toStrictEqual([1, 2, 3]);
	});
});
