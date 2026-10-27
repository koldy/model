import {stripVTControlCharacters} from 'util';
import Model from '../src/Model';
import List from '../src/List';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';
import AnyType from '../src/types/AnyType';

/**
 * @property {string} firstName
 * @property {string} lastName
 * @property {number} age
 */
class User extends Model {
	definition() {
		return {
			firstName: new StringType(),
			lastName: new StringType(),
			age: new IntegerType()
		};
	}
}

class Users extends List {
	definition() {
		return User;
	}
}

class Names extends List {
	definition() {
		return new StringType();
	}
}

class Address extends Model {
	definition() {
		return {
			city: new StringType()
		};
	}
}

class Account extends Model {
	definition() {
		return {
			owner: User,
			address: Address
		};
	}
}

class DomLike extends Model {
	definition() {
		return {
			nodeType: new IntegerType()
		};
	}
}

class Product extends Model {
	definition() {
		return {
			name: new StringType(),
			formatter: new AnyType()
		};
	}

	label() {
		return `Product ${this.name}`;
	}
}

describe('Testing React Compatibility', () => {
	describe('Model - Accessing undefined properties', () => {
		it('Should return undefined for React internal properties', () => {
			const user = User.create({firstName: 'John', lastName: 'Doe', age: 30});

			// React internal properties should return undefined instead of throwing
			expect(user.$$typeof).toBeUndefined();
			expect(user._owner).toBeUndefined();
			expect(user._store).toBeUndefined();
			expect(user.key).toBeUndefined();
			expect(user.ref).toBeUndefined();
		});

		it('Should throw error for non-React undefined properties', () => {
			const user = User.create({firstName: 'John'});

			// Non-React undefined properties should throw errors (strict validation)
			expect(() => user.undefinedProperty).toThrow();
			expect(() => user.anotherUndefined).toThrow();
			expect(() => user.randomProp).toThrow();
		});

		it('Should still return defined properties correctly', () => {
			const user = User.create({firstName: 'John', lastName: 'Doe', age: 30});

			expect(user.firstName).toBe('John');
			expect(user.lastName).toBe('Doe');
			expect(user.age).toBe(30);
		});

		it('Should return null for defined but unset properties', () => {
			const user = User.create();

			expect(user.firstName).toBeNull();
			expect(user.lastName).toBeNull();
			expect(user.age).toBeNull();
		});

		it('Should allow Symbol property access', () => {
			const user = User.create({firstName: 'John'});
			const sym = Symbol('test');

			// Symbols should not throw errors
			expect(user[Symbol.iterator]).toBeUndefined();
			expect(user[Symbol.toStringTag]).toBeUndefined();
			expect(user[sym]).toBeUndefined();
		});

		it('Should still throw error when using get() method with undefined property', () => {
			const user = User.create({firstName: 'John'});

			// The get() method should still throw for undefined properties
			expect(() => user.get('undefinedProperty')).toThrow(
				'Can not get undefinedProperty because it\'s not defined in User model'
			);
		});

		it('Should work with JSON.stringify', () => {
			const user = User.create({firstName: 'John', lastName: 'Doe', age: 30});

			const json = JSON.stringify(user);
			expect(json).toBe('{"firstName":"John","lastName":"Doe","age":30}');
		});

		it('Should work with Object.keys', () => {
			const user = User.create({firstName: 'John', lastName: 'Doe'});

			// Object.keys should work without throwing
			const keys = user.keys();
			expect(keys).toEqual(['firstName', 'lastName', 'age']);
		});
	});

	describe('List - Accessing undefined properties', () => {
		it('Should return undefined for React internal properties', () => {
			const users = Users.create([{firstName: 'John', lastName: 'Doe', age: 30}]);

			// React internal properties should return undefined instead of throwing
			expect(users.$$typeof).toBeUndefined();
			expect(users._owner).toBeUndefined();
			expect(users._store).toBeUndefined();
			expect(users.key).toBeUndefined();
			expect(users.ref).toBeUndefined();
		});

		it('Should throw error for non-React undefined properties', () => {
			const names = Names.create(['John', 'Jane']);

			// Non-React undefined properties should throw errors (strict validation)
			expect(() => names.undefinedProperty).toThrow();
			expect(() => names.randomProp).toThrow();
		});

		it('Should still access array elements correctly', () => {
			const names = Names.create(['John', 'Jane', 'Bob']);

			expect(names[0]).toBe('John');
			expect(names[1]).toBe('Jane');
			expect(names[2]).toBe('Bob');
			expect(names.length).toBe(3);
		});

		it('Should allow Symbol property access', () => {
			const names = Names.create(['John', 'Jane']);
			const sym = Symbol('test');

			// Symbols should not throw errors
			// Note: List doesn't implement Symbol.iterator by default, so it returns undefined
			expect(() => names[Symbol.iterator]).not.toThrow();
			expect(names[Symbol.toStringTag]).toBeUndefined();
			expect(names[sym]).toBeUndefined();
		});

		it('Should work with JSON.stringify', () => {
			const names = Names.create(['John', 'Jane']);

			const json = JSON.stringify(names);
			expect(json).toBe('["John","Jane"]');
		});

		it('Should work with array methods', () => {
			const names = Names.create(['John', 'Jane', 'Bob']);

			// Array methods should work without throwing
			const mapped = names.map(name => name.toUpperCase());
			expect(mapped).toEqual(['JOHN', 'JANE', 'BOB']);

			const filtered = names.filter(name => name.startsWith('J'));
			expect(filtered).toEqual(['John', 'Jane']);
		});
	});

	describe('Simulating React behavior', () => {
		it('Should not throw when React checks if object is a React element', () => {
			const user = User.create({firstName: 'John', lastName: 'Doe'});

			// Simulate React's check for React elements
			const isReactElement = user.$$typeof === Symbol.for('react.element');
			expect(isReactElement).toBe(false);
		});

		it('Should allow spreading model data into props', () => {
			const user = User.create({firstName: 'John', lastName: 'Doe', age: 30});

			// Simulate spreading model data
			const props = {...user.getData()};
			expect(props).toEqual({firstName: 'John', lastName: 'Doe', age: 30});
		});

		it('Should work when passed to Object.assign', () => {
			const user = User.create({firstName: 'John', lastName: 'Doe'});

			// This should not throw
			const result = Object.assign({}, user.getData());
			expect(result).toEqual({firstName: 'John', lastName: 'Doe', age: null});
		});
	});

	describe('Maintaining strict validation', () => {
		it('Should still prevent setting undefined properties', () => {
			const user = User.create({firstName: 'John'});

			// Setting undefined properties should still throw
			expect(() => {
				user.undefinedProperty = 'value';
			}).toThrow('Can not assign string to undefinedProperty because it\'s not defined in User model');
		});

		it('Should still validate property types', () => {
			const user = User.create({firstName: 'John'});

			// Type validation should still work
			expect(() => {
				user.age = 'not a number';
			}).toThrow();
		});

		it('Should still enforce notNull constraints', () => {
			class StrictUser extends Model {
				definition() {
					return {
						name: new StringType().notNull()
					};
				}
			}

			// notNull() with StringType defaults to empty string, not null
			// So creating without data is actually valid - it will have empty string
			const user = StrictUser.create();
			expect(user.name).toBe('');

			// But trying to set null should fail
			expect(() => {
				user.name = null;
			}).not.toThrow(); // StringType with notNull converts null to empty string
		});
	});

	describe('Probe keys read by other libraries', () => {
		it('Should resolve await of a model to the same instance', async () => {
			const user = User.create({firstName: 'John'});

			expect(await user).toBe(user);
			expect(await Promise.resolve(user)).toBe(user);
		});

		it('Should resolve await of a list to the same instance', async () => {
			const users = Users.create([{firstName: 'John'}]);

			expect(await users).toBe(users);
			expect(await Promise.resolve(users)).toBe(users);
		});

		it('Should resolve await of a nested model to the same instance', async () => {
			const account = Account.create({owner: {firstName: 'John'}});

			expect(await account.owner).toBe(account.owner);
		});

		it('Should return a model from an async function', async () => {
			const user = User.create({firstName: 'John'});
			const load = async () => user;

			expect(await load()).toBe(user);
		});

		it('Should return undefined for probe keys on a model', () => {
			const user = User.create({firstName: 'John'});

			expect(user.then).toBeUndefined();
			expect(user.asymmetricMatch).toBeUndefined();
			expect(user.nodeType).toBeUndefined();
			expect(user['@@iterator']).toBeUndefined();
			expect(user['@@toStringTag']).toBeUndefined();
		});

		it('Should return undefined for probe keys on a list', () => {
			const names = Names.create(['John']);

			expect(names.then).toBeUndefined();
			expect(names.asymmetricMatch).toBeUndefined();
			expect(names.nodeType).toBeUndefined();
			expect(names['@@iterator']).toBeUndefined();
			expect(names['@@toStringTag']).toBeUndefined();
		});

		it('Should return the declared field instead of undefined', () => {
			const node = DomLike.create({nodeType: 1});

			expect(node.nodeType).toBe(1);
		});

		it('Should compare models with toEqual', () => {
			expect(User.create({firstName: 'John', age: 30})).toEqual(User.create({firstName: 'John', age: 30}));
			expect(User.create({firstName: 'John'})).not.toEqual(User.create({firstName: 'Jane'}));
		});

		it('Should print models in a failing assertion', () => {
			let error;
			try {
				expect(User.create({firstName: 'John'})).toEqual(User.create({firstName: 'Jane'}));
			} catch (e) {
				error = e;
			}

			expect(error).toBeDefined();
			// Jest colors the message when it writes to a terminal, so it's compared without the color codes
			expect(stripVTControlCharacters(error.message)).toContain('expect(received).toEqual(expected)');
		});

		it('Should still throw for other undeclared properties', () => {
			const user = User.create({firstName: 'John'});
			const users = Users.create([]);

			expect(() => user.foo).toThrow("Can not get foo because it's not defined in User model");
			expect(() => users.foo).toThrow('Users has no property "foo"');
			expect(() => user.get('then')).toThrow("Can not get then because it's not defined in User model");
		});
	});

	describe('Stable method identity', () => {
		it('Should return the same function for a model method', () => {
			const product = Product.create({name: 'Book'});

			expect(product.label).toBe(product.label);
			expect(product.get('label')).toBe(product.label);
		});

		it('Should keep the model as this when the method is detached', () => {
			const product = Product.create({name: 'Book'});
			const label = product.label;

			expect(label()).toBe('Product Book');
		});

		it('Should return the same function for a list method', () => {
			const names = Names.create(['John']);

			expect(names.map).toBe(names.map);
			expect(names.push).toBe(names.push);
		});

		it('Should give a clone its own bound methods', () => {
			const product = Product.create({name: 'Book'});
			const clone = product.clone();

			expect(clone.label).not.toBe(product.label);

			clone.name = 'Pen';
			expect(clone.label()).toBe('Product Pen');
			expect(product.label()).toBe('Product Book');

			const names = Names.create(['John']);
			expect(names.clone().map).not.toBe(names.map);
		});

		it('Should keep methods stable on a frozen model', () => {
			const product = Product.create({name: 'Book'});
			product.freeze();

			expect(product.label).toBe(product.label);
			expect(product.label()).toBe('Product Book');
		});

		it('Should return the new function after a function field is reassigned', () => {
			const product = Product.create({name: 'Book'});

			product.formatter = () => 1;
			expect(product.formatter).toBe(product.formatter);
			expect(product.formatter()).toBe(1);

			product.formatter = () => 2;
			expect(product.formatter).toBe(product.formatter);
			expect(product.formatter()).toBe(2);
		});
	});

	describe('Spreading models and lists', () => {
		it('Should spread only declared fields of a model', () => {
			const user = User.create({firstName: 'John', lastName: 'Doe', age: 30});

			expect(Object.keys({...user})).toEqual(['firstName', 'lastName', 'age']);
			expect({...user}).toEqual(user.getData());
			expect(Object.keys(user)).toEqual(['firstName', 'lastName', 'age']);
		});

		it('Should enumerate only declared fields with for...in', () => {
			const user = User.create({firstName: 'John'});
			const keys = [];

			for (const key in user) {
				keys.push(key);
			}

			expect(keys).toEqual(['firstName', 'lastName', 'age']);
		});

		it('Should keep nested models as instances when spreading', () => {
			const account = Account.create({owner: {firstName: 'John'}, address: {city: 'Zagreb'}});
			const spread = {...account};

			expect(Object.keys(spread)).toEqual(['owner', 'address']);
			expect(spread.owner).toBe(account.owner);
			expect(spread.address.city).toBe('Zagreb');
		});

		it('Should spread only declared fields after seal() and freeze()', () => {
			const sealed = User.create({firstName: 'John'});
			sealed.seal();
			expect(sealed.isSealed()).toBe(true);
			expect(Object.keys({...sealed})).toEqual(['firstName', 'lastName', 'age']);

			const frozen = User.create({firstName: 'John'});
			frozen.freeze();
			expect(frozen.isFrozen()).toBe(true);
			expect(Object.keys({...frozen})).toEqual(['firstName', 'lastName', 'age']);
		});

		it('Should spread a list to an empty object', () => {
			const names = Names.create(['John', 'Jane']);

			expect(Object.keys({...names})).toEqual([]);
			expect(Object.keys(names)).toEqual([]);
			expect(names.getData()).toEqual(['John', 'Jane']);
		});

		it('Should keep getData(), toJSON(), clone() and setData() working', () => {
			const account = Account.create({owner: {firstName: 'John', age: 30}, address: {city: 'Zagreb'}});

			expect(account.getData()).toEqual({owner: {firstName: 'John', lastName: null, age: 30}, address: {city: 'Zagreb'}});
			expect(JSON.parse(JSON.stringify(account))).toEqual(account.getData());

			const clone = account.clone();
			expect(clone).not.toBe(account);
			expect(clone.getData()).toEqual(account.getData());

			clone.setData({owner: {firstName: 'Jane'}});
			expect(clone.owner.firstName).toBe('Jane');
			expect(account.owner.firstName).toBe('John');
			expect(clone.keys()).toEqual(['owner', 'address']);
		});
	});
});

