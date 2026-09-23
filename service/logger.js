import Service from './index.js';

class LoggerService extends Service {
	// The level names the config accepts, ordered as the winston wrapper orders
	// them. A call is forwarded when its level is at or below the configured one.
	static Levels = {
		off: 0,
		fatal: 1,
		error: 2,
		warn: 3,
		info: 4,
		debug: 5,
		trace: 6,
		all: Number.MAX_VALUE
	};

	constructor() {
		super();

		this._loggers = [];
		this._loggersRaw = [];
		this._loggerKeys = [];
		// Until init resolves a level everything is forwarded, so a logger used
		// before init, or with a level name this table does not know, behaves as
		// it always did and the backends apply their own filtering.
		this._level = Number.MAX_VALUE;
	}

	async init(injector) {
		await super.init(injector);

		const configLogging = this._config.get('logging');
		let logLevel = configLogging.level || process.env.LOG_LEVEL || null;
		logLevel = logLevel ? logLevel.trim() : logLevel;
		const prettify = configLogging.prettify || process.env.LOG_PRETTIFY || false;
		console.log();
		console.log('\t----logging.initialization---------------------');
		console.log(`\tconfigLogging.level: ${configLogging.level}`);
		console.log(`\tprocess.env.LOG_LEVEL: ${process.env.LOG_LEVEL}`);
		console.log(`\tlogLevel: ${logLevel}`);
		console.log('\t-------------------------------------------------');
		console.log(`\tconfigLogging.prettify: ${configLogging.prettify}`);
		console.log(`\tprocess.env.LOG_PRETTIFY: ${process.env.LOG_PRETTIFY}`);
		console.log(`\tprettify: ${prettify}`);
		console.log('\t-------------------------------------------------');

		// Gate here, once, rather than in every backend. Each backend checks its
		// own level too, but only after the caller has built the arguments and this
		// facade has fanned the call out to all of them inside try/catch.
		this._level = LoggerService.resolveLevel(logLevel);

		let loggerService;
		for(const key of this._loggerKeys) {
			console.log(`\tlogger: ${key}`);
			loggerService = this._injector.getService(key);
			this._loggers.push(loggerService);
			if (loggerService.raw)
				this._loggersRaw.push(loggerService);
			await loggerService.initLogger(logLevel, prettify, configLogging);
		}
		console.log('\t----logging.initialization.complete------------');
		console.log();
	}

	// For a caller about to build a payload that is only worth building if it
	// will be logged.
	isDebugEnabled() {
		return this.isLevelEnabled('debug');
	}

	isLevelEnabled(level) {
		const value = LoggerService.Levels[level];
		return value === undefined ? true : value <= this._level;
	}

	isTraceEnabled() {
		return this.isLevelEnabled('trace');
	}

	register(key) {
		if (String.isNullOrEmpty(key))
			console.log(`Invalid key '${key}'.`);

		const logger = this._loggerKeys.find(l => l === key);
		if (logger)
			return;

		this._loggerKeys.push(key);
	}

	static resolveLevel(logLevel) {
		if (String.isNullOrEmpty(logLevel))
			return Number.MAX_VALUE;

		const value = LoggerService.Levels[String(logLevel).trim().toLowerCase()];
		return value === undefined ? Number.MAX_VALUE : value;
	}

	debug(clazz, method, message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.debug)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.debug(clazz, method, message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - debug: ', err);
			}
		}
	}

	debug2(message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.debug)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.debug2(message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - debug: ', err);
			}
		}
	}

	error(clazz, method, message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.error)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.error(clazz, method, message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - error: ', err);
			}
		}
	}

	error2(message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.error)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.error2(message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - error: ', err);
			}
		}
	}

	exception(clazz, method, ex, correlationId, isClient) {
		if (this._level < LoggerService.Levels.error)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.exception(clazz, method, ex, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - exception: ', err);
			}
		}
	}

	exception2(ex, correlationId, isClient) {
		if (this._level < LoggerService.Levels.error)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.exception2(ex, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - exception: ', err);
			}
		}
	}

	fatal(clazz, method, message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.fatal)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.fatal(clazz, method, message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - fatal: ', err);
			}
		}
	}

	fatal2(message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.fatal)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.fatal2(message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - fatal: ', err);
			}
		}
	}

	info(clazz, method, message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.info)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.info(clazz, method, message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - info: ', err);
			}
		}
	}

	info2(message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.info)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.info2(message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - info: ', err);
			}
		}
	}

	// Not gated: raw is the caller saying "write this as it is".
	raw(message, data, correlationId, isClient) {
		let index = 0;
		const length = this._loggersRaw.length;
		for (; index < length; index++) {
			try {
				this._loggersRaw[index].raw(message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - raw: ', err);
			}
		}
	}

	trace(clazz, method, message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.trace)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.trace(clazz, method, message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - trace: ', err);
			}
		}
	}

	trace2(message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.trace)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.trace2(message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - trace: ', err);
			}
		}
	}

	warn(clazz, method, message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.warn)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.warn(clazz, method, message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - warn: ', err);
			}
		}
	}

	warn2(message, data, correlationId, isClient) {
		if (this._level < LoggerService.Levels.warn)
			return;

		let logger;
		let index = 0;
		const length = this._loggers.length;
		for (; index < length; index++) {
			logger = this._loggers[index];
			try {
				logger.warn2(message, data, correlationId, isClient);
			}
			catch (err) {
				console.error('logger exception - warn: ', err);
			}
		}
	}
}

export default LoggerService;
