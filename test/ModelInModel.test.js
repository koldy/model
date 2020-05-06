import Model from '../src/Model';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';

class Driver extends Model {
	definition() {
		return {
			firstName: new StringType(),
			age: new IntegerType()
		};
	}
}

class Vehicle extends Model {
	definition() {
		return {
			name: new StringType(),
			wheels: new IntegerType(),
			driver: Driver
		};
	}

	type() {
		throw new Error('Should be overridden');
	}

	label() {
		return `${this.type()} - ${this.name}`;
	}
}

class Car extends Vehicle {
	definition() {
		return {
			...super.definition(),
			numberOfDoors: new IntegerType()
		};
	}

	type() {
		return 'CAR';
	}
}

class Bike extends Vehicle {
	type() {
		return 'BIKE';
	}
}

describe('Testing Model in Model', () => {
	it(`Testing vehicle`, () => {
		const car = Car.create({name: 'Kia'});
		expect(car.name).toBe('Kia');
		expect(car.type()).toBe('CAR');
		expect(car.label()).toBe('CAR - Kia');
		expect(car.driver).toBeInstanceOf(Driver);

		expect(car.driver.firstName).toBeNull();
		expect(car.driver.age).toBeNull();

		car.driver.firstName = 'Vlatko';
		car.driver.age = 25;
		expect(car.driver.firstName).toBe('Vlatko');
		expect(car.driver.age).toBe(25);

		expect(car.getData()).toStrictEqual({
			name: 'Kia',
			wheels: null,
			numberOfDoors: null,
			driver: {
				firstName: 'Vlatko',
				age: 25
			}
		});

		expect(JSON.stringify(car)).toStrictEqual(
			JSON.stringify({
				name: 'Kia',
				wheels: null,
				driver: {
					firstName: 'Vlatko',
					age: 25
				},
				numberOfDoors: null
			})
		);
	});

	it(`Testing bike`, () => {
		const bike = Bike.create({name: 'My Bike'});
		expect(bike.name).toBe('My Bike');
		expect(bike.type()).toBe('BIKE');
		expect(bike.label()).toBe('BIKE - My Bike');
		expect(bike.driver).toBeInstanceOf(Driver);

		expect(bike.driver.firstName).toBeNull();
		expect(bike.driver.age).toBeNull();

		bike.driver.firstName = 'Vlatko';
		bike.driver.age = 25;
		expect(bike.driver.firstName).toBe('Vlatko');
		expect(bike.driver.age).toBe(25);

		expect(bike.getData()).toStrictEqual({
			name: 'My Bike',
			wheels: null,
			driver: {
				firstName: 'Vlatko',
				age: 25
			}
		});

		expect(JSON.stringify(bike)).toStrictEqual(
			JSON.stringify({
				name: 'My Bike',
				wheels: null,
				driver: {
					firstName: 'Vlatko',
					age: 25
				}
			})
		);
	});
});
