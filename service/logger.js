import Service from '@thzero/library_common_service/service/index.js';

class LoggerService extends Service {
	constructor() {
		super();

		this._loggers = [];
		this._loggersRaw = [];
		this._loggerKeys = [];
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

	register(key) {
		if (String.isNullOrEmpty(key))
			console.log(`Invalid key '${key}'.`);

		const logger = this._loggerKeys.find(l => l === key);
		if (logger)
			return;

		this._loggerKeys.push(key);
	}

	debug(clazz, method, message, data, correlationId, isClient) {
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
