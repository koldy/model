import Model from '../src/Model';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';
import List from '../src/List';

class Part extends Model {
	definition() {
		return {
			id: new IntegerType().notNull(),
			name: new StringType().notNull()
		};
	}
}

class Parts extends List {
	definition() {
		return Part;
	}
}

class Car extends Model {
	definition() {
		return {
			id: new IntegerType().notNull(),
			name: new StringType().notNull(),
			parts: Parts
		};
	}
}

describe('Testing Model Nesting', () => {
	const data = {
		id: 1,
		name: 'My car',
		parts: [
			{id: 5, name: 'Wheels'},
			{id: 7, name: 'Steering'}
		]
	};

	const car = Car.create(data);

	it('Test the instance', () => {
		expect(car).toBeInstanceOf(Car);
	});

	it('Test JSON serialization', () => {
		expect(JSON.stringify(car)).toEqual(JSON.stringify(data));
	});

	it('Test submodel value assignments', () => {
		const m = Car.create({
			id: 1,
			name: 'The car'
		});

		expect(m.id).toEqual(1);
		expect(m.parts).toBeInstanceOf(Parts);

		expect(() => m.parts.push({})).toThrowError();
		m.parts.push({
			id: 1,
			name: 'Doors'
		});
		expect(m.parts[0].id).toBe(1);
		expect(m.parts.count()).toBe(1);
		expect(m.parts.length).toBe(1);

		// m.parts = undefined;
		// expect(m.parts).toBeInstanceOf(Parts);
		// expect(m.parts.count()).toBe(0);

		m.parts = null;
		expect(m.parts).toBeInstanceOf(Parts);
		expect(m.parts.count()).toBe(0);
	});

	it('Test submodel null assignments on creation', () => {
		expect(
			Car.create({
				id: 1,
				name: 'The car',
				parts: null
			}).parts
		).toBeInstanceOf(Parts);
	});
});
