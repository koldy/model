import Model from '../../src/Model';
import StringType from '../../src/types/StringType';
import ConstantType from '../../src/types/ConstantType';

class User extends Model {
	definition() {
		return {
			firstName: new StringType(),
			type: new ConstantType('user')
		};
	}
}

class Admin extends Model {
	definition() {
		return {
			firstName: new StringType('Vlatko'),
			type: new ConstantType('admin')
		};
	}
}

class UnknownUser extends Model {
	definition() {
		return {
			firstName: new StringType('Vlatko'),
			type: new ConstantType(null)
		};
	}
}

class ObjectUser extends Model {
	definition() {
		return {
			firstName: new StringType('Vlatko'),
			type: new ConstantType({a: 1})
		};
	}
}

const X = {one: 1};

class SameUser extends Model {
	definition() {
		return {
			firstName: new StringType('Vlatko'),
			type: new ConstantType(X)
		};
	}
}

class DynamicUser extends Model {
	definition() {
		return {
			firstName: new StringType('Vlatko'),
			type: new ConstantType(() => 12345)
		};
	}
}

class BooleanUser extends Model {
	definition() {
		return {
			firstName: new StringType('Vlatko'),
			type: new ConstantType(true)
		};
	}
}

describe(`Testing ConstantType`, () => {
	it(`Should set constant value`, () => {
		const user = User.create();
		expect(user.type).toBe('user');

    const user2 = User.create({type: 'user'});
    expect(user2.type).toBe('user');

    expect(() => User.create({type: 'admin'})).toThrow();
	});

	it(`Should throw error when trying to set constant value`, () => {
		const user = User.create();
		expect(() => (user.type = 'something_else')).toThrow();

		user.type = 'user';
		expect(user.type).toBe('user');
	});

	it(`Should set constant value`, () => {
		const admin = Admin.create();
		expect(admin.type).toBe('admin');
	});

	it(`Should throw error when trying to set constant value`, () => {
		const admin = Admin.create();
		expect(() => (admin.type = 'user')).toThrow();
	});

	it(`Should set constant value`, () => {
		const unknownUser = UnknownUser.create();
		expect(unknownUser.type).toBeNull();

		expect(() => (unknownUser.type = 'user')).toThrow();

		unknownUser.type = null;
		expect(unknownUser.type).toBeNull();
	});

	it(`Should throw error when trying to set mixed types as value`, () => {
		const el = ObjectUser.create();

		expect(() => (el.type = 'user')).toThrow();
		expect(() => (el.type = null)).toThrow();
		expect(() => (el.type = undefined)).toThrow();
		expect(() => (el.type = {b: 2})).toThrow();
		expect(() => (el.type = {a: 1})).toThrow();
	});

  it(`Should set constant value`, () => {
    const sameUser = SameUser.create();
    expect(sameUser.type).toBe(X);

    expect(() => (sameUser.type = 'user')).toThrow();
    expect(() => (sameUser.type = null)).toThrow();
    expect(() => (sameUser.type = undefined)).toThrow();
    expect(() => (sameUser.type = {b: 2})).toThrow();

    sameUser.type = X;
    expect(sameUser.type).toBe(X);
  });

  it(`Should set constant value with dynamic definition`, () => {
    const dynamicUser = DynamicUser.create();
    expect(dynamicUser.type).toBe(12345);

    expect(() => (dynamicUser.type = 'user')).toThrow();
    expect(() => (dynamicUser.type = null)).toThrow();
    expect(() => (dynamicUser.type = undefined)).toThrow();
    expect(() => (dynamicUser.type = {b: 2})).toThrow();

    dynamicUser.type = 12345;
    expect(dynamicUser.type).toBe(12345);

    expect(() => dynamicUser.type = () => 12345).toThrow();
    expect(() => (dynamicUser.type = 12346)).toThrow();
  });

  it(`Should set constant value with boolean`, () => {
    const booleanUser = BooleanUser.create();
    expect(booleanUser.type).toBe(true);

    expect(() => (booleanUser.type = 'user')).toThrow();
    expect(() => (booleanUser.type = null)).toThrow();
    expect(() => (booleanUser.type = undefined)).toThrow();
    expect(() => (booleanUser.type = {b: 2})).toThrow();
    expect(() => (booleanUser.type = false)).toThrow();

    booleanUser.type = true;
    expect(booleanUser.type).toBe(true);
  });
});
