import Service from './index.js';

class ConfigService extends Service {
	constructor(config) {
		super();

		this._config = config;
	}

	get(key, defaultValue) {
		// node-config throws on an unknown key, and the default used to be returned
		// from the catch. That is a stack trace per miss, paid by every optional key
		// read on a request path. Ask first when the provider can answer; the catch
		// stays for one that cannot.
		if (defaultValue !== undefined && typeof this._config.has === 'function' && !this._config.has(key))
			return defaultValue;

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
