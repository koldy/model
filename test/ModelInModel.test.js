import Model from '../src/Model';
import StringType from '../src/types/StringType';
import IntegerType from '../src/types/IntegerType';
import List from '../src/List';

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

class Translation extends Model {
	definition() {
		return {
			languageId: new IntegerType().notNull(),
			text: new StringType()
		};
	}
}

class Translations extends List {
	definition() {
		return Translation;
	}
}

class PriceListItem extends Model {
	definition() {
		return {
			id: new IntegerType().notNull(),
			name: Translations
		};
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

	it('Testing reassigning instances to the model', () => {
		const priceListItem = PriceListItem.create({
			id: 1,
			name: [
				{languageId: 1, text: 'The English name'},
				{languageId: 2, text: 'Hrvatski naziv'}
			]
		});

		expect(priceListItem.id).toBe(1);
		expect(priceListItem.name).toBeInstanceOf(Translations);
		expect(priceListItem.name[0].languageId).toBe(1);
		expect(priceListItem.name[0].text).toBe('The English name');

		const names = priceListItem.name.clone();
		names[1].text = 'Novi naziv';
		priceListItem.name = names;
		expect(priceListItem.name[1].text).toBe('Novi naziv');

		const name2 = priceListItem.name[0].clone();
		name2.text = 'Second English';
		expect(name2.text).toBe('Second English');
		priceListItem.name[0] = name2;
		expect(priceListItem.name[0].text).toBe('Second English');

		// replace translations
		const newTranslations = Translations.create();
		newTranslations.push({
			languageId: 3,
			text: 'German name'
		});
		newTranslations.push({
			languageId: 4,
			text: 'Croatian name'
		});

		priceListItem.name = newTranslations;
		expect(priceListItem.name[1].languageId).toBe(4);
		expect(priceListItem.name[1].text).toBe('Croatian name');

		const newTranslations2 = newTranslations.clone();
		newTranslations2.push({
			languageId: 1,
			text: 'English name'
		});

		priceListItem.name = newTranslations2;
		expect(priceListItem.name[2].languageId).toBe(1);
		expect(priceListItem.name[2].text).toBe('English name');
	});

	it('Testing reassigning instances to the model (short version)', () => {
		const priceListItem = PriceListItem.create({
			id: 1,
			name: [
				{languageId: 1, text: 'The English name'},
				{languageId: 2, text: 'Hrvatski naziv'}
			]
		});

		const newNames = priceListItem.name.clone();
		newNames.push({
			languageId: 3,
			text: 'German name'
		});

		priceListItem.name = newNames;
		expect(priceListItem.name[2].languageId).toBe(3);
		expect(priceListItem.name[2].text).toBe('German name');
	});
});
