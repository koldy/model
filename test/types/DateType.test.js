import Model from '../../src/Model';
import DateType from '../../src/types/DateType';

const STRESS_TESTS = 10000;

class Scenario1 extends Model {
	definition() {
		return {
			date: new DateType()
		};
	}
}

class Scenario2 extends Model {
	definition() {
		return {
			date: new DateType().notNull()
		};
	}
}

class Scenario3 extends Model {
	definition() {
		return {
			date: new DateType(new Date('X'))
		};
	}
}

class Scenario4 extends Model {
	definition() {
		return {
			date: new DateType(new Date(Date.parse('2020-04-22 22:22:22.000')))
		};
	}
}

class Scenario5 extends Model {
	definition() {
		return {
			date: new DateType(new Date(Date.parse('2020-04-22 22:22:22.000'))).notNull()
		};
	}
}

class Scenario6 extends Model {
	definition() {
		return {
			date: new DateType().withCustomValidator(function ({value}) {
				if (value === null) {
					throw new TypeError("Date shouldn't be null");
				}
			})
		};
	}
}

class Scenario7 extends Model {
	definition() {
		return {
			date: new DateType({})
		};
	}
}

class Scenario8 extends Model {
	definition() {
		return {
			date: new DateType('2020-05-03 22:20:02')
		};
	}
}

describe('Testing DateType', () => {
	it(`Testing empty instance`, () => {
		expect(Scenario1.create().date).toBeNull();
		expect(Scenario1.create({date: undefined}).date).toBeNull();
		expect(Scenario1.create({date: null}).date).toBeNull();
		expect(Scenario1.create({x: null}).date).toBeNull();
		expect(Scenario1.create({date: new Date()}).date).toBeInstanceOf(Date);
		expect(Scenario1.create({date: '2020-04-22 22:22:22'}).date).toBeInstanceOf(Date);
	});

	it(`Testing invalid value`, () => {
		expect(() => Scenario1.create({date: 'XXX'}).date).toThrowError('Unable to parse value "XXX" for property "date"');
		expect(() => Scenario1.create({date: true}).date).toThrowError('Expecting "date" to be string or Date, got boolean');
		expect(() => Scenario1.create({date: {}}).date).toThrowError('Expecting "date" to be string or Date, got object');
		expect(() => Scenario1.create({date: []}).date).toThrowError('Expecting "date" to be string or Date, got array');
		expect(() => Scenario1.create({date: 5}).date).toThrowError('Expecting "date" to be string or Date, got number');
	});

	it(`Testing not null`, () => {
		expect(() => Scenario2.create().date).toThrowError(
			'Property "date" should be non-null value; either set the "date" in constructor or set its default value to be a string or Date'
		);
		expect(() => Scenario2.create({date: undefined}).date).toThrowError(
			'Property "date" should be non-null value; either set the "date" in constructor or set its default value to be a string or Date'
		);
		expect(() => Scenario2.create({date: null}).date).toThrowError('Property "date" doesn\'t accept null for its value');

		expect(() => {
			const x = Scenario2.create({date: new Date()});
			x.date = null;
		}).toThrowError('Property "date" doesn\'t accept null for its value');
	});

	it(`Testing invalid instance of Date of default value`, () => {
		expect(() => Scenario3.create()).toThrowError('Can\'t assign default value to property "date" because it has invalid instance of Date');
	});

	it(`Testing valid instance of Date of default value`, () => {
		const date = new Date(Date.parse('2020-04-22 22:22:22.000'));
		expect(Scenario4.create().date.toISOString()).toBe(date.toISOString());
		expect(Scenario4.create({date: null}).date).toBeNull();

		const x = Scenario4.create();
		x.date = null;
		expect(x.date).toBeNull();

		x.date = undefined;
		expect(x.date.toISOString()).toBe(date.toISOString());
	});

	it(`Testing valid instance of Date of default value with not null`, () => {
		const date = new Date(Date.parse('2020-04-22 22:22:22.000'));
		expect(Scenario5.create().date.toISOString()).toBe(date.toISOString());
		expect(() => Scenario5.create({date: null}).date).toThrowError('Property "date" doesn\'t accept null for its value');

		const x = Scenario5.create();
		expect(() => (x.date = null)).toThrowError('Property "date" doesn\'t accept null for its value');

		x.date = undefined;
		expect(x.date.toISOString()).toBe(date.toISOString());

		x.date = '2020-05-03 22:15:50';
		expect(x.date.toISOString()).toBe(new Date(Date.parse('2020-05-03 22:15:50')).toISOString());
	});

	it(`Stress testing initialisation with string`, () => {
		for (let i = 0; i <= STRESS_TESTS; i += 1) {
			expect(Scenario4.create({date: '2020-04-22 22:22:22.000'})).toBeInstanceOf(Scenario4);
		}
	});

	it(`Stress testing initialisation with string, then getting Date`, () => {
		const date = new Date(Date.parse('2020-04-22 22:22:22.000'));

		for (let i = 0; i <= STRESS_TESTS; i += 1) {
			expect(Scenario4.create({date: '2020-04-22 22:22:22.000'}).date.toISOString()).toBe(date.toISOString());
		}
	});

	it(`Testing custom validator`, () => {
		expect(() => Scenario6.create({date: null})).toThrowError("Date shouldn't be null");

		const x = Scenario6.create({date: new Date()});
		expect(() => (x.date = null)).toThrowError("Date shouldn't be null");
	});

	it(`Testing invalid default value`, () => {
		expect(() => Scenario7.create()).toThrowError('Invalid default value for property "date", expected string or Date, got object');
	});

	it(`Testing string default value`, () => {
		expect(Scenario8.create().date.toISOString()).toBe(new Date(Date.parse('2020-05-03 22:20:02')).toISOString());
	});

	it(`Testing getter parsing error`, () => {
		const x = Scenario1.create();

		x.date = '2020-XX-YY AA:B0:CC';
		expect(() => x.date).toThrowError('Unable to parse value "2020-XX-YY AA:B0:CC" for property "date"');

		x.date = 'ABC-BLA';
		expect(() => x.date).toThrowError('Unable to parse value "ABC-BLA" for property "date"');
	});

	it(`Testing getter invalid instance`, () => {
		expect(() => (Scenario1.create().date = new Date('ABC'))).toThrowError('Property "date" got invalid instance of Date');
	});
});
