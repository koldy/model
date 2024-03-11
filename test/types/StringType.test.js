import Model from '../../src/Model';
import StringType from '../../src/types/StringType';

const STRESS_TESTS = 10000;

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
	};
}

/**
 * @property {string} firstName
 * @property {string} lastName
 */
class Admin extends Model {
	definition() {
		return {
			firstName: new StringType('Vlatko'),
			lastName: new StringType('Koudela')
		};
	};
}

class Scenario3 extends Model {
	definition() {
		return {
			name: new StringType().notNull()
		};
	};
}

class Scenario4 extends Model {
  definition() {
    return {
      name: new StringType().notNull().withCustomValidator(function ({value}) {
        if (value.length < 5 || value.length > 10) {
          throw new TypeError('Value should be between 5 and 10 characters');
        }
      })
    };
  }
}

class Scenario5 extends Model {
	definition() {
		return {
			name: new StringType().withCustomValidator({})
		};
	};
}

class Scenario6 extends Model {
	definition() {
		return {
			name: new StringType(() => 'one').notNull()
		};
	};
}

class Scenario7 extends Model {
	definition() {
		return {
			name: new StringType().withCustomGetter(function ({value}) {
        return !!value ? 'yes' : 'no';
      })
		};
	};
}

describe(`Testing StringType`, () => {
	it(`Testing empty instance of User`, () => {
		const u = User.create({
			firstName: 'Vlatko'
		});

		expect(u.firstName).toEqual('Vlatko');
	});

	it(`Throw error on undefined prop`, () => {
		const u = User.create({
			firstName: 'Vlatko'
		});

		expect(() => u.middleName).toThrowError();
	});

	it(`Get null on unset prop`, () => {
		const u = User.create({
			firstName: 'Vlatko'
		});

		expect(u.lastName).toBeNull();

		u.lastName = '';
		expect(u.lastName).toBeNull();

		u.lastName = 555;
		expect(u.lastName).toBe('555');
	});

	it(`Test first and last name getter`, () => {
		const u = User.create({
			firstName: 'Vlatko',
			lastName: 'Koudela'
		});

		expect(u.firstName).toEqual('Vlatko');
		expect(u.lastName).toEqual('Koudela');
	});

	it(`Test setter on undefined property`, () => {
		const u = User.create({
			firstName: 'Vlatko',
			lastName: 'Koudela'
		});

		expect(() => u.middleName = 'yo').toThrowError();
	});

	it(`Testing getData() on empty instance of User`, () => {
		const u = User.create();

		expect(u.getData()).toStrictEqual({
			firstName: null,
			lastName: null
		});

		expect(u.firstName).toBeNull();
		expect(u.lastName).toBeNull();
	});

	it(`Testing getData() on partial instance of User`, () => {
		const u = User.create({
			firstName: 'Vlatko'
		});

		expect(u.getData()).toStrictEqual({
			firstName: 'Vlatko',
			lastName: null
		});
	});

	it(`Get default value`, () => {
		const a = Admin.create();
		expect(a.firstName).toBe('Vlatko');
		expect(a.lastName).toBe('Koudela');
	});

	it(`Testing getData() on ${STRESS_TESTS} instances of User`, () => {
		for (let i = 0; i < STRESS_TESTS; i += 1) {
			const u = User.create();

			expect(u.getData()).toStrictEqual({
				firstName: null,
				lastName: null
			});
		}
	});

	it(`Testing firstName access on ${STRESS_TESTS} instances of User`, () => {
		for (let i = 0; i < STRESS_TESTS; i += 1) {
			const u = User.create({
				firstName: 'Vlatko'
			});

			expect(u.firstName).toBe('Vlatko');
		}
	});

	it(`Testing setters and access on ${STRESS_TESTS} instances of User`, () => {
		for (let i = 0; i < STRESS_TESTS; i += 1) {
			const u = User.create();

			u.firstName = 'Vlatko';
			u.lastName = 'Koudela';

			expect(u.firstName).toBe('Vlatko');
			expect(u.lastName).toBe('Koudela');
		}
	});

	it(`Testing ${STRESS_TESTS} setters and access on 1 instance of User`, () => {
		const u = User.create();

		for (let i = 0; i < STRESS_TESTS; i += 1) {
			u.firstName = 'Vlatko';
			u.lastName = 'Koudela';

			expect(u.firstName).toBe('Vlatko');
			expect(u.lastName).toBe('Koudela');
		}
	});

	it(`Testing not null`, () => {
		expect(Scenario3.create().name).toBe('');

		expect(Scenario3.create({name: null}).name).toBe('');
		expect(Scenario3.create({name: ''}).name).toBe('');
		expect(Scenario3.create({name: undefined}).name).toBe('');
	})

	it(`Testing custom validator`, () => {
		expect(() => Scenario4.create({name: 'Sky'})).toThrowError('Value should be between 5 and 10 characters');
		expect(Scenario4.create({name: 'Vlatko'}).name).toBe('Vlatko');
	})

	it(`Testing invalid validator`, () => {
		expect(() => Scenario5.create({name: 'Sky'})).toThrowError('Expected function for validator, got object');
	})

	it(`Testing function as default value`, () => {
		expect(Scenario6.create({name: 'Sky'}).name).toBe('Sky');
		expect(Scenario6.create({}).name).toBe('one');
		expect(Scenario6.create().name).toBe('one');

    const a = Scenario6.create();
    expect(a.name).toBe('one');

    a.name = 'Vlatko';
    expect(a.name).toBe('Vlatko');

    a.name = null;
    expect(a.name).toBe('');
	})

  it(`Testing with custom getter`, () => {
    const a = Scenario7.create({name: 'Vlatko'});
    expect(a.name).toBe('yes');

    a.name = '';
    expect(a.name).toBe('no');

    a.name = null;
    expect(a.name).toBe('no');
  });
});
