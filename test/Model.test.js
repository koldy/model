import Model from '../src/Model';
import StringType from '../src/types/StringType';
import AnyType from '../src/types/AnyType';
import IntegerType from '../src/types/IntegerType';
import ObjectType from '../src/types/ObjectType';
import FloatType from '../src/types/FloatType';
import List from '../src/List';

/**
 * @property {string} firstName
 * @property {string} lastName
 */
class User extends Model {
	definition() {
		return {
			firstName: new StringType(),
			lastName: new StringType()
		};
	}

	fullName() {
		return `${this.firstName} ${this.lastName}`;
	}
}

/**
 * @property {number} id
 */
class Admin extends User {
	definition() {
		return {
			id: new AnyType(),
			...super.definition()
		};
	}
}

class Scenario1 extends Model {
	definition() {
		return {
			address: {
				street: new StringType(),
				number: new IntegerType(),
				postCode: new IntegerType(),
				suburb: {
					name: new StringType().notNull(),
					type: new StringType(),
					age: new FloatType(5.5).decimals(2)
				}
			}
		};
	}
}

class Names extends List {
	definition() {
		return new StringType();
	}
}

class Scenario2 extends Model {
	definition() {
		return {
			id: new AnyType(),
			names: Names
		};
	}
}

describe('Testing Model', () => {
	it(`Testing empty instance of User`, () => {
		expect(User.create()).toBeInstanceOf(User);
	});

	it(`Testing empty instance of Model`, () => {
		expect(User.create()).toBeInstanceOf(Model);
	});

	it(`Testing wrong User initialization`, () => {
		expect(() => new User()).toThrowError();
	});

	it(`Testing displayName of User`, () => {
		expect(User.create().displayName()).toBe('User');
	});

	it(`Testing getters of User`, () => {
		const u = User.create();

		expect(() => u.id).toThrowError();
		expect(u.firstName).toBeNull();
		expect(u.lastName).toBeNull();
	});

	it(`Testing hasProperty of User`, () => {
		const u = User.create();
		expect(u.hasProperty('firstName')).toBeTruthy();
		expect(u.hasProperty('lastName')).toBeTruthy();
		expect(u.hasProperty('id')).toBeFalsy();
		expect(() => u.hasProperty()).toThrowError('User.hasProperty() expects first parameter to be string, got undefined');
	});

	it(`Testing manual set and get methods`, () => {
		const u = User.create();

		u.set('firstName', 'Vlatko');
		u.set('lastName', 'Koudela');

		expect(u.firstName).toBe('Vlatko');
		expect(u.lastName).toBe('Koudela');
		expect(u.fullName()).toBe('Vlatko Koudela');

		u.set('firstName', 'Second');
		u.set('lastName', 'Third');

		expect(u.get('firstName')).toBe('Second');
		expect(u.get('lastName')).toBe('Third');
		expect(() => u.get()).toThrowError('User.get() expects first parameter to be string, got undefined');
		expect(() => u.set(null, 'Sky')).toThrowError('User.set() expects first parameter to be string, got object');
	});

	it(`Testing empty instance of Admin`, () => {
		expect(Admin.create()).toBeInstanceOf(Admin);
	});

	it(`Testing empty instance of Admin`, () => {
		expect(Admin.create()).toBeInstanceOf(Admin);
	});

	it(`Testing wrong Admin initialization`, () => {
		expect(() => new Admin()).toThrowError();
	});

	it(`Testing displayName of Admin`, () => {
		expect(Admin.create().displayName()).toBe('Admin');
	});

	it(`Testing getters of Admin where all properties are null`, () => {
		const a = Admin.create();
		expect(a.id).toBeNull();
		expect(a.firstName).toBeNull();
		expect(a.lastName).toBeNull();
	});

	it(`Testing hasProperty of Admin`, () => {
		const u = Admin.create();
		expect(u.hasProperty('firstName')).toBeTruthy();
		expect(u.hasProperty('lastName')).toBeTruthy();
		expect(u.hasProperty('id')).toBeTruthy();
	});

	it(`Testing manual set and get methods`, () => {
		const u = Admin.create();

		u.set('id', 5);
		u.set('firstName', 'Vlatko');
		u.set('lastName', 'Koudela');

		expect(u.id).toBe(5);
		expect(u.firstName).toBe('Vlatko');
		expect(u.lastName).toBe('Koudela');

		u.set('id', 2);
		u.set('firstName', 'Second');
		u.set('lastName', 'Third');

		expect(u.get('id')).toBe(2);
		expect(u.get('firstName')).toBe('Second');
		expect(u.get('lastName')).toBe('Third');
	});

	it(`Testing anonymous instance`, () => {
		const u = Model.create(
			{},
			{
				name: new StringType(),
				count: new IntegerType(5),
				address: new ObjectType().notNull(),
				subset: {
					id: new IntegerType(),
					name: new StringType().notNull()
				}
			}
		);
		expect(u.name).toBeNull();
		expect(u.count).toBe(5);
		expect(u.address).toStrictEqual({});
		expect(u.subset).toBeInstanceOf(Model);
		expect(u.subset.id).toBeNull();
		expect(u.subset.name).toBe('');
	});

	it(`Testing nesting`, () => {
		const u = Scenario1.create();
		expect(u.address).toBeInstanceOf(Model);
		expect(u.address.street).toBeNull();
		expect(u.address.number).toBeNull();
		expect(u.address.postCode).toBeNull();
		expect(u.address.suburb).toBeInstanceOf(Model);
		expect(u.address.suburb.name).toBe('');
		expect(u.address.suburb.type).toBeNull();
		expect(u.address.suburb.age).toBe(5.5);

		u.address.number = 8;
		expect(u.address.number).toBe(8);
		expect(() => (u.address.number = {})).toThrowError();
		expect(u.address.number).toBe(8);

		u.address.suburb.age = '8.2531';
		expect(u.address.suburb.age).toBe(8.25);

		u.address.suburb = {
			name: 'Other',
			type: 'Sub',
			age: 2.1,
			x: 5
		};

		expect(u.address.suburb.name).toBe('Other');
		expect(u.address.suburb.type).toBe('Sub');
		expect(u.address.suburb.age).toBe(2.1);
		expect(u.address.suburb.getData()).toStrictEqual({
			name: 'Other',
			type: 'Sub',
			age: 2.1
		});

		expect(u.getData()).toStrictEqual({
			address: {
				street: null,
				number: 8,
				postCode: null,
				suburb: {
					name: 'Other',
					type: 'Sub',
					age: 2.1
				}
			}
		});

		expect(() => (u.address.suburb.x = 5)).toThrowError();

		expect(() => u.setData(null)).toThrowError('Scenario1.setData() expects object as parameter, got object');

		u.setData({
			address: {
				street: null,
				number: 8,
				postCode: null,
				suburb: {
					name: 'Other',
					type: 'Sub',
					age: 2.1
				}
			}
		});

		expect(u.getData()).toStrictEqual({
			address: {
				street: null,
				number: 8,
				postCode: null,
				suburb: {
					name: 'Other',
					type: 'Sub',
					age: 2.1
				}
			}
		});
	});

	it(`Testing cloning`, () => {
		const a = User.create();
		const b = a;

		expect(a).toBe(b);

		a.firstName = 'Vlatko';
		expect(b.firstName).toBe('Vlatko');

		const a2 = a.clone();
		const b2 = b.clone();

		expect(a2).not.toBe(a);
		expect(b2).not.toBe(b);

		expect(a2.firstName).toBe('Vlatko');
		expect(b2.firstName).toBe('Vlatko');

		a2.lastName = 'Koudela';
		expect(a2.lastName).toBe('Koudela');
		expect(b2.lastName).toBeNull();
	});

	it(`Testing Lists in Model`, () => {
		const a = Scenario2.create();

		a.id = 1;
		expect(a.id).toBe(1);

		expect(a.names).toBeInstanceOf(Names);

		a.names.push('Vlatko');
		expect(a.names[0]).toBe('Vlatko');

		a.names = ['Ivana', 'Koudela'];
		expect(a.names[0]).toBe('Ivana');
		expect(a.names[1]).toBe('Koudela');
		expect(a.names).toBeInstanceOf(List);
		expect(a.names.toArray()).toStrictEqual(['Ivana', 'Koudela']);
	});

	it(`Testing anonymous Model and anonymous List in Model`, () => {
		const a = Model.create(
			{
				id: 'Nekaj'
			},
			{
				id: new AnyType(),
				names: List.of(new StringType())
			}
		);

		expect(a).toBeInstanceOf(Model);
		expect(a.id).toBe('Nekaj');

		a.names = ['Vlatko', 'Koudela'];
		expect(a.names).toBeInstanceOf(List);
		expect(a.names.toArray()).toStrictEqual(['Vlatko', 'Koudela']);

		a.names = [];
		expect(a.names.toArray()).toStrictEqual([]);
	});

	it(`Testing JSON serialization`, () => {
		expect(JSON.stringify(User.create())).toBe(JSON.stringify({firstName: null, lastName: null}));

		expect(JSON.stringify(User.create({firstName: 'Vlatko', lastName: 'Koudela'}))).toBe(
			JSON.stringify({firstName: 'Vlatko', lastName: 'Koudela'})
		);

		expect(JSON.stringify(Scenario1.create())).toBe(
			JSON.stringify({
				address: {
					street: null,
					number: null,
					postCode: null,
					suburb: {
						name: '',
						type: null,
						age: 5.5
					}
				}
			})
		);
	});

	it(`Testing keys/values`, () => {
		expect(User.create().keys()).toStrictEqual(['firstName', 'lastName']);
		expect(User.create().values()).toStrictEqual([null, null]);
	});

	it(`Testing seal`, () => {
		const x = User.create();

		x.seal();
		expect(x.isSealed()).toBeTruthy();
	});

	it(`Testing freeze`, () => {
		const x = User.create();

		x.freeze();
		expect(x.isFrozen()).toBeTruthy();
	});
});
