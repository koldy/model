import Model from '../../src/Model';
import FloatType from '../../src/types/FloatType';

class Scenario1 extends Model {
	definition() {
		return {
			count: new FloatType()
		};
	}
}

class Scenario2 extends Model {
	definition() {
		return {
			count: new FloatType(55)
		};
	}
}

class Scenario3 extends Model {
	definition() {
		return {
			count: new FloatType().notNull()
		};
	}
}

class Scenario4 extends Model {
	definition() {
		return {
			count: new FloatType(77).notNull()
		};
	}
}

class Scenario5 extends Model {
	definition() {
		return {
			count: new FloatType().notNull().withCustomValidator(function ({value}) {
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
			count: new FloatType(10).notNull().withCustomValidator(function ({value}) {
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
			count: new FloatType(65)
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
			x: new FloatType(12.3456).notNull().min(11.11111).max(55.55555).decimals(2),
			y: new FloatType(12.3456).notNull().min(11.11111).max(55.55555).decimals(2)
		};
	}
}

class Scenario9 extends Model {
	definition() {
		return {
			count: new FloatType().min({})
		};
	}
}

class Scenario10 extends Model {
	definition() {
		return {
			count: new FloatType().max({})
		};
	}
}

class Scenario11 extends Model {
	definition() {
		return {
			count: new FloatType().decimals({})
		};
	}
}

class Scenario12 extends Model {
	definition() {
		return {
			count: new FloatType().decimals(3.9)
		};
	}
}

class Scenario13 extends Model {
	definition() {
		return {
			count: new FloatType().decimals(-1)
		};
	}
}

describe('Testing FloatType', () => {
	it(`Testing empty instance`, () => {
		const u = Scenario1.create();
		expect(u.count).toBeNull();
	});

	it(`Testing non-empty instance`, () => {
		expect(Scenario1.create({count: 5.1}).count).toBe(5.1);
		expect(Scenario1.create({count: 0}).count).toBe(0);
		expect(Scenario1.create({count: -1}).count).toBe(-1);
		expect(Scenario1.create({count: -153252346.33}).count).toBe(-153252346.33);
	});

	it(`Testing casting float to integer`, () => {
		const u = Scenario1.create({
			count: 5.8512
		});
		expect(u.count).toBe(5.8512);
	});

	it(`Testing casting string to integer`, () => {
		expect(Scenario1.create({count: '5.8512'}).count).toBe(5.8512);
		expect(Scenario1.create({count: '4'}).count).toBe(4);
		expect(Scenario1.create({count: '-5.8512'}).count).toBe(-5.8512);
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

	it(`Testing decimals`, () => {
		expect(Scenario8.create().x).toBe(12.34);
		expect(Scenario8.create({x: undefined}).x).toBe(12.34);
		expect(() => Scenario8.create({x: null}).x).toThrowError('Expecting "x" not to be null');
		expect(Scenario8.create().getData()).toStrictEqual({x: 12.34, y: 12.34});

		const a = Scenario8.create();
		expect(a.x + a.y).toBe(24.68);

		a.x = 22.3333;
		expect(a.x).toBe(22.33);

		a.y = 33.4444;
		expect(a.y).toBe(33.44);

		expect(a.x + a.y).toBe(22.33 + 33.44);
	});

	it(`Testing invalid min/max/decimals values`, () => {
		expect(() => Scenario9.create()).toThrowError('Given minimum value for FloatType is not valid number; expected number, got object');
		expect(() => Scenario10.create()).toThrowError('Given maximum value for FloatType is not valid number; expected number, got object');
		expect(() => Scenario11.create()).toThrowError('Given decimals value for FloatType is not valid number; expected number, got object');
		expect(() => Scenario12.create()).toThrowError('Given decimals value for FloatType should be integer, not float; got 3.9');
		expect(() => Scenario13.create()).toThrowError('Given decimals value for FloatType should be positive integer; got -1');
	});

  it(`Testing assign string and empty string`, () => {
    expect(Scenario2.create({count: ''}).count).toBeNull();
    expect(() => Scenario3.create({count: ''})).toThrowError('Can not assign empty string to non-nullable FloatType property "count"');

    const s2 = Scenario2.create();
    s2.count = '';
    expect(s2.count).toBeNull();

    const s4 = Scenario4.create();
    expect(() => {
      s4.count = '';
    }).toThrowError('Can not assign empty string to non-nullable FloatType property "count"');
  });
});
