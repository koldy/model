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

    expect(() => User.create({type: 'admin'})).toThrowError();
	});

	it(`Should throw error when trying to set constant value`, () => {
		const user = User.create();
		expect(() => (user.type = 'something_else')).toThrowError();

		user.type = 'user';
		expect(user.type).toBe('user');
	});

	it(`Should set constant value`, () => {
		const admin = Admin.create();
		expect(admin.type).toBe('admin');
	});

	it(`Should throw error when trying to set constant value`, () => {
		const admin = Admin.create();
		expect(() => (admin.type = 'user')).toThrowError();
	});

	it(`Should set constant value`, () => {
		const unknownUser = UnknownUser.create();
		expect(unknownUser.type).toBeNull();

		expect(() => (unknownUser.type = 'user')).toThrowError();

		unknownUser.type = null;
		expect(unknownUser.type).toBeNull();
	});

	it(`Should throw error when trying to set mixed types as value`, () => {
		const el = ObjectUser.create();

		expect(() => (el.type = 'user')).toThrowError();
		expect(() => (el.type = null)).toThrowError();
		expect(() => (el.type = undefined)).toThrowError();
		expect(() => (el.type = {b: 2})).toThrowError();
		expect(() => (el.type = {a: 1})).toThrowError();
	});

  it(`Should set constant value`, () => {
    const sameUser = SameUser.create();
    expect(sameUser.type).toBe(X);

    expect(() => (sameUser.type = 'user')).toThrowError();
    expect(() => (sameUser.type = null)).toThrowError();
    expect(() => (sameUser.type = undefined)).toThrowError();
    expect(() => (sameUser.type = {b: 2})).toThrowError();

    sameUser.type = X;
    expect(sameUser.type).toBe(X);
  });

  it(`Should set constant value with dynamic definition`, () => {
    const dynamicUser = DynamicUser.create();
    expect(dynamicUser.type).toBe(12345);

    expect(() => (dynamicUser.type = 'user')).toThrowError();
    expect(() => (dynamicUser.type = null)).toThrowError();
    expect(() => (dynamicUser.type = undefined)).toThrowError();
    expect(() => (dynamicUser.type = {b: 2})).toThrowError();

    dynamicUser.type = 12345;
    expect(dynamicUser.type).toBe(12345);

    expect(() => dynamicUser.type = () => 12345).toThrowError();
    expect(() => (dynamicUser.type = 12346)).toThrowError();
  });

  it(`Should set constant value with boolean`, () => {
    const booleanUser = BooleanUser.create();
    expect(booleanUser.type).toBe(true);

    expect(() => (booleanUser.type = 'user')).toThrowError();
    expect(() => (booleanUser.type = null)).toThrowError();
    expect(() => (booleanUser.type = undefined)).toThrowError();
    expect(() => (booleanUser.type = {b: 2})).toThrowError();
    expect(() => (booleanUser.type = false)).toThrowError();

    booleanUser.type = true;
    expect(booleanUser.type).toBe(true);
  });
});
