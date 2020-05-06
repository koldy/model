import Model from '../../src/Model';
import BooleanType from '../../src/types/BooleanType';

class Scenario1 extends Model {
	definition() {
		return {
			ok: new BooleanType()
		};
	}
}

class Scenario2 extends Model {
	definition() {
		return {
			ok: new BooleanType().notNull()
		};
	}
}

class Scenario3 extends Model {
	definition() {
		return {
			ok: new BooleanType(true)
		};
	}
}

class Scenario4 extends Model {
	definition() {
		return {
			ok: new BooleanType(true).notNull()
		};
	}
}

class Scenario5 extends Model {
	definition() {
		return {
			ok: new BooleanType(true).notNull().withCustomValidator(function ({value}) {
				if (value !== true) {
					throw new TypeError('Ok must always be true!');
				}
			})
		};
	}
}

class Scenario6 extends Model {
	definition() {
		return {
			ok: new BooleanType('OK')
		};
	}
}

describe('Testing BooleanType', () => {
	it(`Testing empty instance`, () => {
		const u = Scenario1.create();
		expect(u.ok).toBeNull();
	});

	it(`Testing setters`, () => {
		const u = Scenario1.create();

		u.ok = true;
		expect(u.ok).toBeTruthy();

		u.ok = false;
		expect(u.ok).toBeFalsy();

		u.ok = null;
		expect(u.ok).toBeNull();

		u.ok = undefined;
		expect(u.ok).toBeNull();

		expect(() => (u.ok = 'yes')).toThrowError('Expecting "ok" to be boolean, got string');
		expect(() => (u.ok = 5)).toThrowError('Expecting "ok" to be boolean, got number');
		expect(() => (u.ok = [])).toThrowError('Expecting "ok" to be boolean, got array');
		expect(() => (u.ok = {})).toThrowError('Expecting "ok" to be boolean, got object');
		expect(() => (u.ok = function () {})).toThrowError('Expecting "ok" to be boolean, got function');
	});

	it(`Testing not null`, () => {
		expect(() => Scenario2.create()).toThrowError(
			'Property "ok" has null for its default value, but it doesn\'t accept null. Either set "ok" in create() to be boolean or set its default value'
		);

		expect(() => Scenario2.create({ok: null})).toThrowError('Property "ok" should be boolean and never null');
		expect(() => Scenario2.create({ok: undefined})).toThrowError(
			'Property "ok" has null for its default value, but it doesn\'t accept null. Either set "ok" in create() to be boolean or set its default value'
		);
	});

	it(`Testing default value`, () => {
		expect(Scenario3.create().ok).toBeTruthy();
		expect(Scenario3.create({ok: false}).ok).toBeFalsy();
		expect(Scenario3.create({ok: null}).ok).toBeNull();
	});

	it(`Testing default value not null`, () => {
		expect(Scenario4.create().ok).toBeTruthy();
		expect(Scenario4.create({ok: undefined}).ok).toBeTruthy();
		expect(Scenario4.create({ok: false}).ok).toBeFalsy();
		expect(() => Scenario4.create({ok: null})).toThrowError('Property "ok" should be boolean and never null');
	});

	it(`Testing custom validator`, () => {
		expect(Scenario5.create().ok).toBeTruthy();
		expect(Scenario5.create({ok: undefined}).ok).toBeTruthy();
		expect(() => Scenario5.create({ok: false}).ok).toThrowError('Ok must always be true!');
		expect(() => {
			const u = Scenario5.create();
			u.ok = false;
		}).toThrowError('Ok must always be true!');
		expect(() => {
			const u = Scenario5.create({ok: true});
			u.ok = false;
		}).toThrowError('Ok must always be true!');
	});

	it(`Testing invalid default value type`, () => {
		expect(() => Scenario6.create()).toThrowError('Property "ok" should have boolean for its default value, got string');
	});
});
