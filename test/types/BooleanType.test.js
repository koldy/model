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

class Scenario7 extends Model {
	definition() {
		return {
			ok: new BooleanType().withCustomGetter(function ({value}) {
				return true;
			})
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

	it(`Testing setting boolean as string`, () => {
		expect(Scenario4.create().ok).toBeTruthy();
		expect(Scenario4.create({ok: 'true'}).ok).toBeTruthy();
		expect(Scenario4.create({ok: 'false'}).ok).toBeFalsy();
		expect(Scenario4.create({ok: 'TRUE'}).ok).toBeTruthy();
		expect(Scenario4.create({ok: 'FALSE'}).ok).toBeFalsy();
		expect(Scenario4.create({ok: 'TruE'}).ok).toBeTruthy();
		expect(Scenario4.create({ok: 'FalsE'}).ok).toBeFalsy();
		expect(() => Scenario4.create({ok: ''})).toThrowError('Can not assign empty string to non-nullable BooleanType property "ok"');
		expect(() => Scenario4.create({ok: 'falsy'})).toThrowError('Expecting "ok" to be boolean, got string');

		const s4 = Scenario4.create();
		s4.ok = 'TruE';
		expect(s4.ok).toBeTruthy();
		s4.ok = 'FalSE';
		expect(s4.ok).toBeFalsy();
		expect(() => (s4.ok = 'nothing')).toThrowError('Expecting "ok" to be boolean, got string');
		expect(() => (s4.ok = 5)).toThrowError('Expecting "ok" to be boolean, got number');

		expect(Scenario3.create({ok: 'true'}).ok).toBeTruthy();
		expect(Scenario3.create({ok: 'false'}).ok).toBeFalsy();
		expect(Scenario3.create({ok: 'TRUE'}).ok).toBeTruthy();
		expect(Scenario3.create({ok: 'FALSE'}).ok).toBeFalsy();
		expect(Scenario3.create({ok: 'TruE'}).ok).toBeTruthy();
		expect(Scenario3.create({ok: 'FalsE'}).ok).toBeFalsy();
		expect(Scenario3.create({ok: ''}).ok).toBeNull();
		expect(() => Scenario3.create({ok: 'falsy'})).toThrowError('Expecting "ok" to be boolean, got string');

		const s3 = Scenario3.create();
		s3.ok = 'TruE';
		expect(s3.ok).toBeTruthy();
		s3.ok = 'FalSE';
		expect(s3.ok).toBeFalsy();
		s3.ok = '';
		expect(s3.ok).toBeNull();
		expect(() => (s3.ok = 'nothing')).toThrowError('Expecting "ok" to be boolean, got string');
		expect(() => (s3.ok = 7)).toThrowError('Expecting "ok" to be boolean, got number');
		expect(() => (s3.ok = () => {})).toThrowError('Expecting "ok" to be boolean, got function');

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

	it(`Testing with custom getter`, () => {
		const u = Scenario7.create();
		expect(u.ok).toBeTruthy();
		u.ok = false;
		expect(u.ok).toBeTruthy();
		u.ok = true;
		expect(u.ok).toBeTruthy();
	});
});
