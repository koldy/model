import Model from '../../src/Model';
import AnyType from '../../src/types/AnyType';

class Scenario1 extends Model {
	definition() {
		return {
			firstName: new AnyType(),
			lastName: new AnyType()
		};
	}
}

class Scenario2 extends Model {
	definition() {
		return {
			firstName: new AnyType('Vlatko'),
			lastName: new AnyType('Koudela')
		};
	}
}

class Scenario3 extends Model {
	definition() {
		return {
			firstName: new AnyType({}),
			lastName: new AnyType([])
		};
	}
}

class Scenario4 extends Model {
	definition() {
		return {
			firstName: new AnyType().withCustomValidator(({value}) => {
				if (value === null || value === 2) {
					throw new TypeError('Value should not be null or 2');
				}
			})
		};
	}
}

describe('Testing AnyType', () => {
	it(`Testing empty instance`, () => {
		const u = Scenario1.create();
		expect(u.firstName).toBeNull();
	});

	it(`Testing non-empty instance with object and null`, () => {
		const u = Scenario1.create({
			firstName: {},
			lastName: null
		});
		expect(u.firstName).toStrictEqual({});
		expect(u.lastName).toBeNull();
	});

	it(`Testing non-empty instance with boolean and array`, () => {
		const u = Scenario1.create({
			firstName: true,
			lastName: []
		});
		expect(u.firstName).toBe(true);
		expect(u.lastName).toStrictEqual([]);
	});

	it(`Testing AnyType default value`, () => {
		const u = Scenario2.create();
		expect(u.firstName).toBe('Vlatko');
		expect(u.lastName).toBe('Koudela');
	});

	it(`Testing AnyType default value`, () => {
		expect(Scenario2.create().getData()).toStrictEqual({
			firstName: 'Vlatko',
			lastName: 'Koudela'
		});

		expect(Scenario3.create().getData()).toStrictEqual({
			firstName: {},
			lastName: []
		});
	});

	it(`Testing AnyType setters`, () => {
		const u = Scenario1.create();

		u.firstName = 'Vlatko';
		u.lastName = 'Koudela';

		expect(u.firstName).toBe('Vlatko');
		expect(u.lastName).toBe('Koudela');
	});

	it(`Testing AnyType setters with default values`, () => {
		const u = Scenario2.create();

		u.firstName = 'Vlatko';
		u.lastName = undefined;

		expect(u.firstName).toBe('Vlatko');
		expect(u.lastName).toBe('Koudela');
	});

	it(`Testing AnyType complex setters - object and array`, () => {
		const u = Scenario1.create();

		u.firstName = [];
		u.lastName = {};

		expect(u.firstName).toStrictEqual([]);
		expect(u.lastName).toStrictEqual({});
	});

	it(`Testing AnyType complex setters - boolean and undefined`, () => {
		const u = Scenario1.create();

		u.firstName = true;
		u.lastName = undefined;

		expect(u.firstName).toStrictEqual(true);
		expect(u.lastName).toBeNull();
	});

	it(`Testing custom validator`, () => {
		expect(() => Scenario4.create({firstName: null})).toThrowError('Value should not be null or 2');
		expect(() => Scenario4.create({firstName: 2})).toThrowError('Value should not be null or 2');
	});

	it(`Testing prop display name`, () => {
		const x = Scenario1.create();
		expect(x.getDefinitions().firstName.displayName()).toBe('AnyType');
	});
});
