import Model from '../../src/Model';
import IntegerType from '../../src/types/IntegerType';

class Scenario1 extends Model {
	definition() {
		return {
			count: new IntegerType()
		};
	}
}

class Scenario2 extends Model {
	definition() {
		return {
			count: new IntegerType(55)
		};
	}
}

class Scenario3 extends Model {
	definition() {
		return {
			count: new IntegerType().notNull()
		};
	}
}

class Scenario4 extends Model {
	definition() {
		return {
			count: new IntegerType(77).notNull()
		};
	}
}

class Scenario5 extends Model {
	definition() {
		return {
			count: new IntegerType().notNull().withCustomValidator(function ({value}) {
				if (value < 55) {
					throw new TypeError('Count should not be less than 55');
				}

				if (value > 77) {
					throw new TypeError('Count should not be greater than 77');
				}
			})
		};
	}
}

class Scenario6 extends Model {
	definition() {
		return {
			count: new IntegerType(10).notNull().withCustomValidator(function ({value}) {
				if (value < 55) {
					throw new TypeError('Count should not be less than 55');
				}

				if (value > 77) {
					throw new TypeError('Count should not be greater than 77');
				}
			})
		};
	}
}

class Scenario7 extends Model {
	definition() {
		return {
			count: new IntegerType(65)
				.notNull()
				.between(70, 80)
				.withCustomValidator(function ({value}) {
					if (value < 60) {
						throw new TypeError('Count should not be less than 55');
					}

					if (value > 90) {
						throw new TypeError('Count should not be greater than 77');
					}
				})
		};
	}
}

class Scenario8 extends Model {
	definition() {
		return {
			count: new IntegerType().min('5')
		};
	}
}

class Scenario9 extends Model {
	definition() {
		return {
			count: new IntegerType().max('5')
		};
	}
}

class Scenario10 extends Model {
	definition() {
		return {
			count: new IntegerType().withCustomGetter(function ({value}) {
        return !!value ? value + 10 : 'N/A';
      })
		};
	}
}

describe('Testing IntegerType', () => {
	it(`Testing empty instance`, () => {
		const u = Scenario1.create();
		expect(u.count).toBeNull();
	});

	it(`Testing non-empty instance`, () => {
		expect(Scenario1.create({count: 5}).count).toBe(5);
		expect(Scenario1.create({count: 0}).count).toBe(0);
		expect(Scenario1.create({count: -1}).count).toBe(-1);
		expect(Scenario1.create({count: -153252346.33}).count).toBe(-153252346);
		expect(Scenario1.create({count: '-1'}).count).toBe(-1);
		expect(Scenario1.create({count: '-153252346.33'}).count).toBe(-153252346);
		expect(Scenario1.create({count: '+5'}).count).toBe(5);
		expect(Scenario1.create({count: '+153252346.33'}).count).toBe(153252346);
	});

	it(`Testing casting float to integer`, () => {
		const u = Scenario1.create({
			count: 5.8512
		});
		expect(u.count).toBe(5);
	});

	it(`Testing casting string to integer`, () => {
		expect(Scenario1.create({count: '5.8512'}).count).toBe(5);
		expect(Scenario1.create({count: '4'}).count).toBe(4);
		expect(Scenario1.create({count: '-5.8512'}).count).toBe(-5);
		expect(Scenario1.create({count: '-4'}).count).toBe(-4);
	});

	it(`Testing errors`, () => {
		// expect(() => Scenario1.create({count: [5]})).toThrowError('Can not declare property "_firstName" in Scenario2 model because it starts with underscore which is forbidden');

		expect(() => {
			const x = Scenario1.create();
			x.count = [];
		}).toThrowError('Expecting "count" to be String, got array');

		expect(() => {
			const x = Scenario1.create();
			x.count = {};
		}).toThrowError('Expecting "count" to be String, got object');

		expect(() => {
			const x = Scenario1.create();
			x.count = true;
		}).toThrowError('Expecting "count" to be String, got boolean');

		expect(() => {
			const x = Scenario1.create();
			x.count = function () {};
		}).toThrowError('Expecting "count" to be String, got function');

		expect(() => Scenario1.create({count: '--4'})).toThrowError('Failed to parse string "--4" to integer');
	});

	it(`Testing default value`, () => {
		expect(Scenario2.create().count).toBe(55);
		expect(Scenario2.create({count: 12}).count).toBe(12);
		expect(Scenario2.create({count: '25'}).count).toBe(25);
		expect(Scenario2.create({count: null}).count).toBeNull();
		expect(Scenario2.create({count: undefined}).count).toBe(55);

		expect(Scenario3.create({count: 5}).count).toBe(5);

		expect(() => Scenario6.create().count).toThrowError('Default value error: Count should not be less than 55');
		expect(() => Scenario7.create().count).toThrowError('Default value error: 70 is minimum value allowed for "count", got 65');
		expect(() => Scenario7.create({count: 69}).count).toThrowError('70 is minimum value allowed for "count", got 69');
		expect(() => Scenario7.create({count: 89}).count).toThrowError('80 is maximum value allowed for "count", got 89');
	});

	it(`Testing not null`, () => {
		expect(() => Scenario3.create({count: undefined})).toThrowError(
			'Property "count" shouldn\'t be null and its default value is null which is not acceptable'
		);
		expect(() => Scenario3.create({count: null})).toThrowError(
			'Property "count" shouldn\'t be null and its default value is null which is not acceptable'
		);
		expect(Scenario3.create({count: 0}).count).toBe(0);
	});

	it(`Testing not null and default value`, () => {
		expect(Scenario4.create({count: undefined}).count).toBe(77);
		expect(() => Scenario4.create({count: null})).toThrowError('Expecting "count" not to be null');
		expect(Scenario4.create({count: 0}).count).toBe(0);
	});

	it(`Testing custom validator`, () => {
		expect(() => Scenario5.create({count: undefined})).toThrowError();
		expect(() => Scenario5.create({count: null})).toThrowError();
		expect(() => Scenario5.create({count: 33})).toThrowError('Count should not be less than 55');
		expect(() => Scenario5.create({count: 88})).toThrowError('Count should not be greater than 77');
	});

	it(`Testing wrong min/max definition`, () => {
		expect(() => Scenario8.create()).toThrowError('Given minimum value for IntegerType is not valid number; expected number, got string');
		expect(() => Scenario9.create()).toThrowError('Given maximum value for IntegerType is not valid number; expected number, got string');
	});

	it(`Testing assign string and empty string`, () => {
		expect(Scenario2.create({count: ''}).count).toBeNull();
		expect(() => Scenario3.create({count: ''})).toThrowError('Can not assign empty string to non-nullable IntegerType property "count"');

		const s2 = Scenario2.create();
		s2.count = '';
		expect(s2.count).toBeNull();

		const s4 = Scenario4.create();
		expect(() => {
			s4.count = '';
		}).toThrowError('Can not assign empty string to non-nullable IntegerType property "count"');
	});

	it(`Testing with custom getter`, () => {
    const u = Scenario10.create();
    expect(u.count).toBe('N/A');
    u.count = 5;
    expect(u.count).toBe(15);
    u.count = 0;
    expect(u.count).toBe('N/A');
    u.count = null;
    expect(u.count).toBe('N/A');
    u.count = undefined;
    expect(u.count).toBe('N/A');
	});
});
