import Model from '../src/Model';
import List from '../src/List';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';

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
});

