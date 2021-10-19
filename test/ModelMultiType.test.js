import Model from '../src/Model';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';

class Group extends Model {
	definition() {
		return {
			id: new IntegerType(),
			name: new StringType()
		};
	}
}

class User extends Model {
	definition() {
		return {
			id: new IntegerType(),
			age: [new IntegerType(), new StringType()],
			group: [new StringType(), Group]
		};
	}
}

describe('Testing Multi Type', () => {
	it(`Testing user's age [IntegerType|StringType] with string`, () => {
		const x = User.create({
			id: 1,
			age: 'eighteen'
		});

		expect(x.age).toBe('eighteen');
	});

	it(`Testing user's age [IntegerType|StringType] with number`, () => {
		const x = User.create({
			id: 1,
			age: 18
		});

		expect(x.age).toBe(18);
	});

	it(`Testing user's group [StringType|Group] with string`, () => {
		const x = User.create({
			id: 1,
			age: 18,
			group: 'abc123'
		});

		expect(x.group).toBe('abc123');
	});

	it(`Testing user's group [StringType|Group] with Group`, () => {
		const x = User.create({
			id: 1,
			age: 18,
			group: {
				id: 1,
				name: 'Admin'
			}
		});

		expect(x.group).toBeInstanceOf(Group);
		expect(x.group.id).toBe(1);
		expect(x.group.name).toBe('Admin');
	});

	it(`Testing user's age [IntegerType|StringType] with string and setting new value`, () => {
		const x = User.create({
			id: 1,
			age: 'eighteen'
		});

		expect(x.age).toBe('eighteen');
		x.age = 18;
		expect(x.age).toBe(18);
	});

	it(`Testing user's age [IntegerType|StringType] with number and setting new value`, () => {
		const x = User.create({
			id: 1,
			age: 18
		});

		expect(x.age).toBe(18);
		x.age = 'eighteen';
		expect(x.age).toBe('eighteen');
	});

	it(`Testing user's group [StringType|Group] with Group and setting new value back and forth`, () => {
		const x = User.create({
			id: 1,
			age: 18,
			group: {
				id: 1,
				name: 'Admin'
			}
		});

		x.group = 'xyz888';
		expect(x.group).toBe('xyz888');

		x.group = Group.create({
			id: 2,
			name: 'Standard account'
		});

		expect(x.group).toBeInstanceOf(Group);
		expect(x.group.id).toBe(2);

		x.group = {
			id: 3,
			name: 'Other'
		};

		expect(x.group).toBeInstanceOf(Group);
		expect(x.group.id).toBe(3);
	});
});
