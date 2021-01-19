import Service from './index';

class ConfigService extends Service {
	constructor(config) {
		super();

		this._config = config;
	}

	get(key, defaultValue) {
		try {
			return this._config.get(key);
		}
		catch (err) {
			if (defaultValue !== undefined)
				return defaultValue;
			throw err;
		}
	}
}

export default ConfigService;
