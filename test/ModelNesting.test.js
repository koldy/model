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
});
