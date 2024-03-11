import Model from '../../src/Model';
import ObjectType from '../../src/types/ObjectType';

class Scenario1 extends Model {
	definition() {
		return {
			list: new ObjectType()
		};
	}
}

class Scenario2 extends Model {
	definition() {
		return {
			list: new ObjectType().notNull()
		};
	}
}

class Scenario3 extends Model {
	definition() {
		return {
			list: new ObjectType(1)
		};
	}
}

class Scenario4 extends Model {
	definition() {
		return {
			list: new ObjectType({one: 1})
		};
	}
}

class Scenario5 extends Model {
	definition() {
		return {
			list: new ObjectType({one: 1}).notNull()
		};
	}
}

class Scenario6 extends Model {
	definition() {
		return {
			list: new ObjectType({one: 1}).notNull().withCustomValidator(function ({value}) {
				if (value.one < 10) {
					throw new TypeError('One should be less than 10');
				}

				if (value.one > 20) {
					throw new TypeError('One should be bigger than 20');
				}
			})
		};
	}
}

class Scenario7 extends Model {
	definition() {
		return {
			list: new ObjectType().withCustomGetter(function ({value}) {
				return !value ? {one: 1} : value;
			})
		};
	}
}

describe('Testing ObjectType', () => {
	it(`Testing empty instance`, () => {
		const u = Scenario1.create();
		expect(u.list).toBeNull();
	});

	it(`Testing array setters`, () => {
		const u = Scenario1.create();

		u.list = {};
		expect(u.list).toStrictEqual({});

		u.list = null;
		expect(u.list).toBeNull();

		u.list = {one: 1, two: 2};
		expect(u.list).toStrictEqual({one: 1, two: 2});

		u.list = undefined;
		expect(u.list).toBeNull();
	});

	it(`Testing wrong type assignment errors`, () => {
		const u = Scenario1.create();

		expect(() => (u.list = 5)).toThrowError('Expecting "list" to be object, got number');
		expect(() => (u.list = 0.12)).toThrowError('Expecting "list" to be object, got number');
		expect(() => (u.list = 12n)).toThrowError('Expecting "list" to be object, got bigint');
		expect(() => (u.list = '5')).toThrowError('Expecting "list" to be object, got string');
		expect(() => (u.list = [])).toThrowError('Expecting "list" to be object, got array');
		expect(() => (u.list = function () {})).toThrowError('Expecting "list" to be object, got function');
	});

	it(`Testing assignment on not null`, () => {
		const u = Scenario2.create({list: {}});
		expect(u.list).toStrictEqual({});

		u.list = null;
		expect(u.list).toStrictEqual({});

		u.list = undefined;
		expect(u.list).toStrictEqual({});
	});

	it(`Testing invalid definition`, () => {
		expect(() => Scenario3.create()).toThrowError('Default value in ObjectType must be type of object, got number');
	});

	it(`Testing default value`, () => {
		expect(Scenario4.create().list).toStrictEqual({one: 1});
		expect(Scenario4.create({list: {one: 1}}).list).toStrictEqual({one: 1});
		expect(Scenario4.create({list: {}}).list).toStrictEqual({});
		expect(Scenario4.create({list: null}).list).toBeNull();
		expect(Scenario4.create({list: undefined}).list).toStrictEqual({one: 1});
	});

	it(`Testing default value with not null`, () => {
		expect(Scenario5.create().list).toStrictEqual({one: 1});
		expect(Scenario5.create({list: {one: 1}}).list).toStrictEqual({one: 1});
		expect(Scenario5.create({list: {}}).list).toStrictEqual({});
		expect(Scenario5.create({list: {one: null}}).list).toStrictEqual({one: null});
		expect(Scenario5.create({list: null}).list).toStrictEqual({});
		expect(Scenario5.create({list: undefined}).list).toStrictEqual({one: 1});
	});

	it(`Testing custom validator`, () => {
		expect(() => Scenario6.create()).toThrowError('Default value error: One should be less than 10');
		expect(() => Scenario6.create({list: {one: 1, two: 2}})).toThrowError('One should be less than 10');
		expect(Scenario6.create({list: {one: 15, two: 2}}).list).toStrictEqual({one: 15, two: 2});
	});

	it(`Testing custom getter`, () => {
		const obj = Scenario7.create();
    expect(obj.list).toStrictEqual({one: 1});
    obj.list = {name: 'Vlatko'};
    expect(obj.list).toStrictEqual({name: 'Vlatko'});
    obj.list = null;
    expect(obj.list).toStrictEqual({one: 1});

    const obj2 = Scenario7.create({list: null});
    expect(obj2.list).toStrictEqual({one: 1});

    const obj3 = Scenario7.create({list: {name: 'Vlatko'}});
    expect(obj3.list).toStrictEqual({name: 'Vlatko'});
	});
});
