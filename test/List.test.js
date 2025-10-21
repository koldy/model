import List from '../src/List';
import Model from '../src/Model';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';
import BooleanType from '../src/types/BooleanType';

/**
 * @property {string} firstName
 * @property {string} lastName
 */
class Scenario1 extends List {
	definition() {
		return new StringType();
	}
}

/**
 * @property {string} firstName
 * @property {string} lastName
 */
class Scenario2 extends List {
	definition() {
		return new StringType('Vlatko').notNull();
	}
}

class Address extends Model {
	definition() {
		return {
			street: new StringType(),
			city: new StringType()
		};
	}
}

class Person extends Model {
	definition() {
		return {
			firstName: new StringType(),
			lastName: new StringType()
		};
	}
}

class Scenario3 extends List {
	definition() {
		return Address;
	}
}

class Bike extends Model {
	definition() {
		return {
			name: new StringType().notNull(),
			wheels: new IntegerType().notNull().min(1)
		};
	}
}

class Bikes extends List {
	definition() {
		return Bike;
	}
}

class Vehicles extends List {
	definition() {
		return Bikes;
	}
}

class Scenario4 extends List {
	definition() {
		return function () {
			this.create = function () {};
		};
	}
}

describe('Testing List', () => {
	it(`Testing instance of`, () => {
		expect(Scenario1.create()).toBeInstanceOf(Scenario1);
		expect(Scenario1.create()).toBeInstanceOf(List);
	});

	it(`Testing adding strings`, () => {
		const x = Scenario1.create(['Vlatko', 'Koudela']);
		expect(x.get(0)).toBe('Vlatko');
		expect(x.get(1)).toBe('Koudela');
		expect(x[0]).toBe('Vlatko');
		expect(x[1]).toBe('Koudela');
		expect(x.length).toBe(2);
		expect(x.count()).toBe(2);

		expect(x.pop()).toBe('Koudela');
		expect(x.length).toBe(1);

		expect(x.shift()).toBe('Vlatko');
		expect(x.length).toBe(0);

		x.push('Vlatko');
		expect(x[0]).toBe('Vlatko');
		expect(x.length).toBe(1);

		x[0] = 'Sky';
		expect(x[0]).toBe('Sky');
		expect(x.length).toBe(1);

		expect(() => (x[null] = 'Vlatko')).toThrow("Scenario1 doesn't allow assigning this");
		expect(() => x.getMe).toThrow('Scenario1 has no property "getMe"');
	});

	it(`Testing invalid type errors`, () => {
		const x = Scenario1.create(['Vlatko']);
		expect(() => (x[0] = {})).toThrow('Expecting list element to be String, got object');
		expect(() => (x[0] = [])).toThrow('Expecting list element to be String, got array');
		expect(() => (x[0] = true)).toThrow('Expecting list element to be String, got boolean');
		expect(() => (x[0] = function () {})).toThrow('Expecting list element to be String, got function');
	});

	it(`Testing other type errors`, () => {
		const list = Scenario1.create();
		expect(() => list.set('a', 'b')).toThrow('Scenario1.set() expected number for the first parameter, got string');
		expect(() => list.set(-1, 'b')).toThrow('Scenario1.set() expected zero or positive integer for first parameter');
		expect(() => list.get('a')).toThrow('Scenario1.get() expected number for the first parameter, got string');
		expect(() => list.get(-1)).toThrow('Scenario1.get() expected zero or positive integer for first parameter');
	});

	it(`Testing calling new`, () => {
		expect(() => new Scenario1()).toThrow(
			'Use Scenario1.create() to create the instance of Scenario1 model, don\'t use "new Scenario1()"'
		);
	});

	it(`Testing calling create with non-array`, () => {
		expect(() => Scenario1.create('')).toThrow('Expected array for Scenario1.create(), got string');
	});

	it(`Testing map`, () => {
		const x = Scenario1.create(['Vlatko', 'Koudela']);
		expect(x.map((y) => y)).toStrictEqual(['Vlatko', 'Koudela']);
	});

	it(`Testing filter`, () => {
		const x = Scenario1.create(['Vlatko', 'Koudela']);
		expect(x.filter((el) => el === 'Koudela')).toStrictEqual(['Koudela']);
	});

	it(`Testing find`, () => {
		const x = Scenario1.create(['Vlatko', 'Koudela']);
		expect(x.find((el) => el === 'Vlatko')).toBe('Vlatko');
	});

	it(`Testing findIndex`, () => {
		const x = Scenario1.create(['Vlatko', 'Koudela']);
		expect(x.findIndex((el) => el === 'Vlatko')).toBe(0);
		expect(x.findIndex((el) => el === 'Koudela')).toBe(1);
	});

	it(`Testing default value and not null`, () => {
		expect(Scenario2.create([null]).getData()).toStrictEqual(['']);
		expect(Scenario2.create([null, null]).getData()).toStrictEqual(['', '']);
	});

	it(`Testing definition of Model`, () => {
		expect(Scenario3.create().getData()).toStrictEqual([]);
		expect(Scenario3.create([{}]).get(0)).toBeInstanceOf(Address);

		const a = Scenario3.create();
		a.push({
			city: 'Varazdin'
		});

		expect(a[0].city).toBe('Varazdin');

		a.push(
			Address.create({
				city: 'Slavonski Brod'
			})
		);

		expect(a[1].city).toBe('Slavonski Brod');

		expect(() => a.push(Person.create({firstName: 'Vlatko'}))).toThrow('Expected instance of "Address", got instance of "Person"');
		expect(a[2]).toBeNull();
	});

	it(`Testing array of strict models`, () => {
		const bikes = Bikes.create();

		expect(bikes.length).toBe(0);
		expect(() => bikes.push({})).toThrow('Property "wheels" shouldn\'t be null and its default value is null which is not acceptable');
	});

	it(`Testing array of array of models`, () => {
		const vehicles = Vehicles.create();
		expect(vehicles.length).toBe(0);

		vehicles.push(Bikes.create());
		expect(vehicles.length).toBe(1);

		vehicles[0].push({
			name: 'First bike',
			wheels: 2
		});

		expect(vehicles.length).toBe(1);
		expect(vehicles[0]).toBeInstanceOf(Bikes);
		expect(vehicles[0].length).toBe(1);

		vehicles[0].push(
			Bike.create({
				name: 'Second bike',
				wheels: 2
			})
		);

		expect(vehicles[0].length).toBe(2);
		expect(vehicles[0][0]).toBeInstanceOf(Bike);
		expect(vehicles[0][0].name).toBe('First bike');
		expect(vehicles[0][0].wheels).toBe(2);
		expect(vehicles[0][1].name).toBe('Second bike');

		vehicles[0][1].name = 'Tricycle';
		vehicles[0][1].wheels = 3;
		expect(vehicles[0][1].name).toBe('Tricycle');
		expect(vehicles[0][1].wheels).toBe(3);

		expect(() => (vehicles[0][1].name = false)).toThrow('Expecting name to be String, got boolean');
	});

	it(`Testing cloning`, () => {
		const a = Scenario1.create();
		const b = a;

		expect(a).toBe(b);

		a.push('Vlatko');
		expect(b[0]).toBe('Vlatko');

		const a2 = a.clone();
		const b2 = b.clone();

		expect(a2).not.toBe(a);
		expect(b2).not.toBe(b);

		expect(a2[0]).toBe('Vlatko');
		expect(b2[0]).toBe('Vlatko');

		a2.push('Koudela');
		expect(a2[1]).toBe('Koudela');
		expect(b2[1]).toBeNull();
	});

	it(`Testing JSON serialization`, () => {
		expect(JSON.stringify(Scenario1.create())).toBe(JSON.stringify([]));

		expect(JSON.stringify(Scenario1.create(['Vlatko', 'Koudela']))).toBe(JSON.stringify(['Vlatko', 'Koudela']));

		expect(JSON.stringify(Scenario3.create())).toBe(JSON.stringify([]));

		expect(
			JSON.stringify(
				Scenario3.create([
					{
						street: 'One st',
						city: 'Other city'
					}
				])
			)
		).toBe(
			JSON.stringify([
				{
					street: 'One st',
					city: 'Other city'
				}
			])
		);

		expect(
			JSON.stringify(
				Scenario3.create([
					{
						street: 'One st',
						city: 'Other city'
					},
					{
						street: 'Two st',
						city: 'Second city'
					}
				])
			)
		).toBe(
			JSON.stringify([
				{
					street: 'One st',
					city: 'Other city'
				},
				{
					street: 'Two st',
					city: 'Second city'
				}
			])
		);
	});

	it(`Testing anonymous List`, () => {
		const a = List.create([], new BooleanType());
		expect(() => a.push('Vlatko')).toThrow('Expecting "list element" to be boolean, got string');
	});

	it(`Testing getting definition`, () => {
		expect(Scenario1.create().definition()).toBeTruthy();
	});

	it(`Testing null definition`, () => {
		expect(() => List.create([], null)).toThrow(
			'Invalid definition in List, expected instance of BaseType or function of Model, got null; definition() method is probably not defined'
		);
	});

	it(`Testing invalid function definition`, () => {
		expect(() => List.create([], () => {})).toThrow('Invalid definition in List, expecting instance of BaseType or function of Model');
	});

	it(`Testing invalid number definition`, () => {
		expect(() => List.create([], 5)).toThrow('Invalid definition in List, expecting instance of BaseType or function of Model');
	});

	it(`Testing definition similar to BaseType, but invalid`, () => {
		expect(() => Scenario4.create()).toThrow('Invalid definition in Scenario4, expecting instance of BaseType or function of Model');
	});

	it(`Testing setData with null type`, () => {
		const l = Scenario1.create();
		l.setData(null);
		expect(l.length).toBe(0);
	});

	it(`Testing setData with undefined type`, () => {
		const l = Scenario1.create();
		l.setData(undefined);
		expect(l.length).toBe(0);
	});

	it(`Testing forEvery and mapEvery`, () => {
		const list = Scenario1.create(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']);

		expect(list.length).toBe(12);
		expect(list.map((x) => x)).toStrictEqual([
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
			'nine',
			'ten',
			'eleven',
			'twelve'
		]);
		expect(list.mapEvery(4, (x) => x)).toStrictEqual(['one', 'five', 'nine']);

		let total = 0;
		const r = list.forEvery(4, (x, i) => (total += i));
		expect(r).toBeUndefined();
		expect(total).toBe(12);

		expect(() => list.mapEvery('a', () => {})).toThrow('First parameter expected a number, got string');
		expect(() => list.mapEvery(0, () => {})).toThrow('First parameter expected a positive integer, got: 0');
		expect(() => list.mapEvery(5.2, () => {})).toThrow('First parameter expected integer, got float: 5.2');
		expect(() => list.mapEvery(5, null)).toThrow('Second parameter expected a function, got null');

		list.reset();
		expect(list.length).toBe(0);
	});

  it(`Testing cloning`, () => {
    const list1 = Scenario1.create();
    let list2 = list1;

    expect(list1).toBe(list2);
    expect(list1.length).toBe(0);

    list2 = list1.clone();
    expect(list1).not.toBe(list2);
    expect(list1.length).toBe(0);
    expect(list2.length).toBe(0);

    list2.push('Vlatko');
    expect(list1.length).toBe(0);
    expect(list2.length).toBe(1);
  });
});

describe('Testing private property access', () => {
  test('Accessing _list should return undefined', () => {
    const list = Scenario1.create(['one', 'two', 'three']);

    expect(list._list).toBeUndefined();
    expect(typeof list._list).toBe('undefined');
  });

  test('Accessing _definition should return undefined', () => {
    const list = Scenario1.create(['one', 'two', 'three']);

    expect(list._definition).toBeUndefined();
    expect(typeof list._definition).toBe('undefined');
  });

  test('Accessing _definitionInfo should return undefined', () => {
    const list = Scenario1.create(['one', 'two', 'three']);

    expect(list._definitionInfo).toBeUndefined();
    expect(typeof list._definitionInfo).toBe('undefined');
  });

  test('Private properties should not expose internal data', () => {
    const list = Scenario1.create(['one', 'two', 'three']);

    // Verify the list works correctly
    expect(list[0]).toBe('one');
    expect(list[1]).toBe('two');
    expect(list[2]).toBe('three');
    expect(list.length).toBe(3);

    // But private properties should return undefined
    expect(list._list).toBeUndefined();
    expect(list._definition).toBeUndefined();
    expect(list._definitionInfo).toBeUndefined();

    // Trying to modify through _list should do nothing (since it's undefined)
    if (list._list) {
      list._list.push('four'); // This won't execute because _list is undefined
    }

    // List should still have only 3 items
    expect(list.length).toBe(3);
  });

  test('Invalid properties should still throw errors', () => {
    const list = Scenario1.create(['one', 'two', 'three']);

    // Private properties return undefined (no error)
    expect(list._list).toBeUndefined();

    // But truly invalid properties should throw
    expect(() => {
      const x = list.invalidProperty;
    }).toThrow('Scenario1 has no property "invalidProperty"');
  });
});
