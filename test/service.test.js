import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import '@thzero/library_common/utility/string.js';
import Service from '../service/index.js';

// Each test corresponds to a defect found in the audit; the comment names it.

const newLogger = () => {
	const calls = [];
	const record = (level) => (...args) => calls.push({ level, args });
	return { calls, error: record('error'), warn: record('warn'), exception: record('exception'), debug: record('debug') };
};

let service;
let logger;

beforeEach(() => {
	service = new Service();
	logger = newLogger();
	service._logger = logger;
});

describe('_enforce', () => {
	it('passes silently when the value is truthy', () => {
		assert.doesNotThrow(() => service._enforce('C', 'm', 'value', 'name', 'cid'));
	});

	// Regression: the condition was inverted - a caller-supplied message was
	// overwritten with the generic text, and omitting one left it undefined.
	it('keeps the caller message when one is given', () => {
		assert.throws(() => service._enforce('C', 'm', null, 'name', 'cid', 'custom message'),
			(err) => err.message === 'custom message');
	});

	it('falls back to a generic message when none is given', () => {
		assert.throws(() => service._enforce('C', 'm', null, 'name', 'cid'),
			(err) => err.message === 'name is invalid.');
	});

	it('attaches the correlationId to the thrown error', () => {
		assert.throws(() => service._enforce('C', 'm', null, 'name', 'cid-1'),
			(err) => err.correlationId === 'cid-1');
	});
});

describe('_enforceNotEmpty', () => {
	it('passes for a non-empty value', () => {
		assert.doesNotThrow(() => service._enforceNotEmpty('C', 'm', 'x', 'name', 'cid'));
	});

	it('throws for empty, null and undefined', () => {
		for (const value of ['', null, undefined])
			assert.throws(() => service._enforceNotEmpty('C', 'm', value, 'name', 'cid'), /name is empty/);
	});
});

describe('_enforceNotEmptyMultiple', () => {
	// Regression: two of the three copies of this block dropped the `!`, so the
	// check passed when every field was empty and threw when they were all valid.
	it('passes when every value is non-empty', () => {
		assert.doesNotThrow(() => service._enforceNotEmptyMultiple('C', 'm', ['a', 'b'], ['x', 'y'], 'cid'));
	});

	it('throws when any value is empty', () => {
		assert.throws(() => service._enforceNotEmptyMultiple('C', 'm', ['a', ''], ['x', 'y'], 'cid'));
		assert.throws(() => service._enforceNotEmptyMultiple('C', 'm', ['', ''], ['x', 'y'], 'cid'));
	});
});

describe('_enforceNotNullMultiple', () => {
	// Regression: the loop accumulated `valid &= values` - the array, not the
	// element - which coerced to NaN and made the check fail for every real input.
	it('passes when every value is non-null', () => {
		assert.doesNotThrow(() => service._enforceNotNullMultiple('C', 'm', ['a', 'b'], ['x', 'y'], 'cid'));
		assert.doesNotThrow(() => service._enforceNotNullMultiple('C', 'm', [0, false, ''], ['x', 'y', 'z'], 'cid'));
	});

	it('throws when any value is null or undefined', () => {
		assert.throws(() => service._enforceNotNullMultiple('C', 'm', ['a', null], ['x', 'y'], 'cid'));
		assert.throws(() => service._enforceNotNullMultiple('C', 'm', [undefined], ['x'], 'cid'));
	});
});

describe('_enforceNotNull', () => {
	it('throws only for null and undefined', () => {
		for (const value of [null, undefined])
			assert.throws(() => service._enforceNotNull('C', 'm', value, 'name', 'cid'), /name is null/);
		// note: the guard is `!value`, so falsy values also throw - documented in C16
		assert.throws(() => service._enforceNotNull('C', 'm', 0, 'name', 'cid'));
	});
});

describe('_enforceResponse', () => {
	it('passes for a successful response', () => {
		assert.doesNotThrow(() => service._enforceResponse('C', 'm', { success: true }, 'name', 'cid'));
	});

	// Regression: same inverted message condition as _enforce.
	it('keeps the caller message when one is given', () => {
		assert.throws(() => service._enforceResponse('C', 'm', { success: false }, 'name', 'cid', 'custom'),
			(err) => err.message === 'custom');
	});
});

describe('Response helpers', () => {
	it('_success and _successResponse report success', () => {
		assert.equal(service._hasSucceeded(service._success('cid')), true);
		const response = service._successResponse({ a: 1 }, 'cid');
		assert.equal(service._hasSucceeded(response), true);
		assert.deepEqual(response.results, { a: 1 });
	});

	it('_error reports failure and carries the context', () => {
		const response = service._error('C', 'm', 'boom', null, null, null, 'cid');
		assert.equal(service._hasFailed(response), true);
		assert.equal(response.correlationId, 'cid');
	});

	it('_error logs the message', () => {
		service._error('C', 'm', 'boom', null, null, null, 'cid');
		assert.ok(logger.calls.some(c => c.level === 'error' && c.args.includes('boom')));
	});

	// Regression: _error dereferenced this._logger unconditionally. A service
	// registered straight onto the injector never gets init()'d, so _logger stays
	// null and the catch block threw, masking the error it was reporting.
	it('_error survives a null logger', () => {
		service._logger = null;
		let response;
		assert.doesNotThrow(() => { response = service._error('C', 'm', 'boom', new Error('x'), 'code', null, 'cid'); });
		assert.equal(service._hasFailed(response), true);
	});

	it('_hasFailed treats a missing response as failure', () => {
		assert.equal(service._hasFailed(null), true);
		assert.equal(service._hasFailed(undefined), true);
	});
});

describe('_checkUpdatedTimestamp', () => {
	it('succeeds when either side is missing', () => {
		assert.equal(service._hasSucceeded(service._checkUpdatedTimestamp('cid', null, null, 'thing')), true);
		assert.equal(service._hasSucceeded(service._checkUpdatedTimestamp('cid', { updatedTimestamp: 1 }, null, 'thing')), true);
		assert.equal(service._hasSucceeded(service._checkUpdatedTimestamp('cid', null, { updatedTimestamp: 1 }, 'thing')), true);
	});

	it('succeeds when the stored copy is at least as new as the request', () => {
		const response = service._checkUpdatedTimestamp('cid', { updatedTimestamp: 5 }, { updatedTimestamp: 5 }, 'thing');
		assert.equal(service._hasSucceeded(response), true);
	});

	// Known behaviour, flagged in the audit and not changed: the comparison is
	// `stored >= requested`, so a request carrying an older timestamp still passes.
	// The commented-out line in the source shows `===` was the intent. This test
	// pins current behaviour so a future fix is a deliberate change.
	it('currently accepts a stale request timestamp (see audit)', () => {
		const response = service._checkUpdatedTimestamp('cid', { updatedTimestamp: 10 }, { updatedTimestamp: 1 }, 'thing');
		assert.equal(service._hasSucceeded(response), true);
	});

	it('fails when the request is newer than the stored copy', () => {
		const response = service._checkUpdatedTimestamp('cid', { updatedTimestamp: 1 }, { updatedTimestamp: 10 }, 'thing');
		assert.equal(service._hasFailed(response), true);
	});
});
