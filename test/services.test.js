import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import '@thzero/library_common/utility/string.js';
import LibraryCommonServiceConstants from '../constants.js';
import ConfigService from '../service/config.js';
import LoggerService from '../service/logger.js';
import BaseValidationService from '../service/validation.js';
import BaseMonitoringService from '../service/monitoring.js';

const inject = (target, name, value) => {
	Object.defineProperty(target, name, { value, writable: true, configurable: true });
	return target;
};

describe('ConfigService', () => {
	// It wraps a config provider - node-config in practice - which throws on an
	// unknown key rather than returning undefined. That throw is what the default
	// is for.
	const provider = (values) => ({
		get(key) {
			if (!(key in values))
				throw new Error(`Configuration property "${key}" is not defined`);
			return values[key];
		}
	});

	it('reads a key from the provider', () => {
		const service = new ConfigService(provider({ 'app.port': 3000 }));
		assert.equal(service.get('app.port'), 3000);
	});

	it('returns the default when the key is unknown', () => {
		const service = new ConfigService(provider({}));
		assert.equal(service.get('app.missing', 'fallback'), 'fallback');
		assert.equal(service.get('app.missing', null), null);
	});

	// The default is only used when one was actually supplied. Passing no default
	// lets the provider's throw escape, so a genuinely required key fails loudly
	// at boot rather than becoming undefined somewhere later.
	it('rethrows when no default is supplied', () => {
		const service = new ConfigService(provider({}));
		assert.throws(() => service.get('app.missing'), /is not defined/);
	});

	it('an explicit undefined default is the same as none', () => {
		const service = new ConfigService(provider({}));
		assert.throws(() => service.get('app.missing', undefined), /is not defined/);
	});

	it('a falsy configured value is returned, not replaced by the default', () => {
		const service = new ConfigService(provider({ 'app.enabled': false, 'app.count': 0 }));
		assert.equal(service.get('app.enabled', true), false);
		assert.equal(service.get('app.count', 99), 0);
	});
});

describe('LoggerService', () => {
	// A fan-out logger: it holds keys, resolves them during init, and forwards
	// every call to all of them.
	const newLogger = (name, calls) => ({
		async initLogger(logLevel, prettify, configLogging) { calls.push({ name, init: { logLevel, prettify, configLogging } }); },
		debug(...args) { calls.push({ name, level: 'debug', args }); },
		debug2(...args) { calls.push({ name, level: 'debug2', args }); },
		error(...args) { calls.push({ name, level: 'error', args }); },
		info2(...args) { calls.push({ name, level: 'info2', args }); }
	});

	const newInjector = (services) => ({ getService: (key) => services[key] });

	let service;
	let calls;

	beforeEach(() => {
		service = new LoggerService();
		calls = [];
	});

	it('registers a key once, however many times it is offered', () => {
		service.register('a');
		service.register('a');
		service.register('b');
		assert.deepEqual(service._loggerKeys, [ 'a', 'b' ]);
	});

	it('resolves each registered key during init and initialises it', async () => {
		service.register('a');
		service.register('b');
		const services = {
			a: newLogger('a', calls),
			b: newLogger('b', calls),
			[LibraryCommonServiceConstants.InjectorKeys.SERVICE_CONFIG]: {
				get: () => ({ level: 'debug', prettify: false })
			}
		};
		inject(service, '_injector', newInjector(services));
		inject(service, '_config', services[LibraryCommonServiceConstants.InjectorKeys.SERVICE_CONFIG]);

		await service.init(newInjector(services));

		const inits = calls.filter(c => c.init);
		assert.deepEqual(inits.map(c => c.name), [ 'a', 'b' ]);
		assert.equal(inits[0].init.logLevel, 'debug');
	});

	it('forwards a call to every logger', () => {
		service._loggers = [ newLogger('a', calls), newLogger('b', calls) ];
		service.debug('C', 'm', 'msg', null, 'cid');
		assert.deepEqual(calls.map(c => c.name), [ 'a', 'b' ]);
		assert.deepEqual(calls[0].args, [ 'C', 'm', 'msg', null, 'cid', undefined ]);
	});

	// A broken logger must not take down the application, and must not stop the
	// others from getting the line.
	it('a throwing logger does not stop the rest', () => {
		service._loggers = [
			{ debug() { throw new Error('boom'); } },
			newLogger('good', calls)
		];
		assert.doesNotThrow(() => service.debug('C', 'm', 'msg', null, 'cid'));
		assert.equal(calls.length, 1);
		assert.equal(calls[0].name, 'good');
	});

	it('logs nothing and throws nothing when no logger is registered', () => {
		service._loggers = [];
		assert.doesNotThrow(() => service.debug('C', 'm', 'msg', null, 'cid'));
		assert.doesNotThrow(() => service.error('C', 'm', 'msg', null, 'cid'));
	});
});

describe('BaseValidationService', () => {
	// Abstract in effect: the base validates nothing and always succeeds, so an
	// application that forgets to register a real implementation gets silent
	// acceptance rather than an error. library_server_validation_joi is the one.
	it('succeeds unconditionally on the base', () => {
		const service = new BaseValidationService();
		for (const value of [ null, undefined, {}, 'anything' ]) {
			const response = service.check('cid', null, value);
			assert.equal(service._hasSucceeded(response), true);
			assert.equal(response.correlationId, 'cid');
		}
	});
});

describe('BaseMonitoringService', () => {
	it('declares the whole metrics surface', () => {
		const service = new BaseMonitoringService();
		for (const member of [ 'check', 'increment', 'decrement', 'gauge', 'histogram',
			'distribution', 'set', 'unique', 'event' ])
			assert.equal(typeof service[member], 'function', member);
	});

	it('does nothing and throws nothing, being the abstract base', () => {
		const service = new BaseMonitoringService();
		inject(service, '_logger', { debug() {}, error() {}, exception() {} });
		for (const member of [ 'increment', 'decrement', 'gauge', 'histogram', 'distribution', 'set', 'unique' ])
			assert.doesNotThrow(() => service[member]('cid', 'metric', 1), member);
	});
});

describe('constants', () => {
	// These four are separate from library_server's keys - they are what every
	// Service and Repository resolves for itself during init, on either side.
	it('declares the four injector keys the Service base resolves', () => {
		assert.deepEqual(LibraryCommonServiceConstants.InjectorKeys, {
			SERVICE_CONFIG: 'serviceConfig',
			SERVICE_LOGGER: 'serviceLogger',
			SERVICE_MONITORING: 'serviceMonitoring',
			SERVICE_VALIDATION: 'serviceValidation'
		});
	});
});
