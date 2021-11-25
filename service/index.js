import LibraryConstants from '../constants';
import LibraryCommonConstants from '@thzero/library_common/constants';

import Response from '@thzero/library_common/response';

class Service {
	constructor() {
		this._config = null;
		this._logger = null;

		this._serviceValidation = null;
	}

	async init(injector) {
		this._injector = injector;

		this._config = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_CONFIG);
		this._logger = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_LOGGER);
		this._serviceValidation = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_VALIDATION);
	}

	async initPost() {
	}

	_checkUpdatedTimestamp(correlationId, value, requestedValue, objectType) {
		if (!value && !requestedValue)
			return this._success(correlationId);
		if (!value)
			return this._success(correlationId);
		if (!requestedValue)
			return this._success(correlationId);

		let valid = value.updatedTimestamp >= requestedValue.updatedTimestamp;
		this._logger.debug('Service', '_checkUpdatedTimestamp', 'valid', valid, correlationId, );
		if (!valid)
			return this._error('Service', '_checkUpdatedTimestamp', 'Invalid timestamp.', null, null, null, correlationId).addGeneric('Object already changed', LibraryCommonConstants.ErrorFields.ObjectChanged, { objectType: this._initResponse(correlationId).paramIl8n(objectType) });

		// valid = value.updatedTimestamp === requestedValue.updatedTimestamp;
		// this._logger.debug('_checkUpdatedTimestamp.valid', valid);
		// if (!valid)
		// 	return this._error('Service', '_checkUpdatedTimestamp', null, err, null, null, correlationId).addGeneric('Object already changed', LibraryCommonConstants.ErrorFields.ObjectChanged, { objectType: this._initResponse(correlationId).paramIl8n(objectType) });

		return this._success(correlationId);
	}

	_enforce(clazz, method, value, name, correlationId, message) {
		if (String.isNullOrEmpty(value)) {
			if (!String.isNullOrEmpty(message))
				message = `${name} is invalid.`;

			this._logger.error(clazz, method, message, null, correlationId);
			const error = Error(message, true);
			error.correlationId = correlationId;
			throw error;
		}
	}

	_enforceNotEmpty(clazz, method, value, name, correlationId) {
		if (String.isNullOrEmpty(value)) {
			this._logger.error(clazz, method, `${name} is empty.`, null, correlationId);
			const error = Error(`${name} is empty.`, true);
			error.correlationId = correlationId;
			throw error;
		}
	}
	
	_enforceNotEmptyEither(clazz, method, value1, value2, name1, name2, correlationId) {
		if (String.isNullOrEmpty(value1) && String.isNullOrEmpty(value2)) {
			this._logger.error(clazz, method, `Either ${name1} or ${name2} are empty.`, null, correlationId);
			throw Error(`Either ${name1} or ${name2} are empty.`);
		}
	}

	_enforceNotNull(clazz, method, value, name, correlationId) {
		if (!value) {
			this._logger.error(clazz, method, `${name} is null.`, null, correlationId);
			const error = Error(`${name} is null.`, true);
			error.correlationId = correlationId;
			throw error;
		}
	}

	_enforceNotEmptyResponse(clazz, method, value, name, correlationId) {
		if (String.isNullOrEmpty(value)) {
			this._logger.error(clazz, method, `${name} is empty.`, null, correlationId);
			return Response.error(clazz, method, `${name} is empty.`, null, null, null, correlationId);
		}

		return this._success(correlationId);
	}

	_enforceNotNullResponse(clazz, method, value, name, correlationId) {
		if (!value) {
			this._logger.error(clazz, method, `${name} is null.`, null, correlationId);
			return Response.error(clazz, method, `${name} is null.`, null, null, null, correlationId);
		}

		return this._success(correlationId);
	}

	_enforceNotEmptyAsResponse(clazz, method, value, name, correlationId) {
		if (String.isNullOrEmpty(value)) {
			this._logger.error(clazz, method, `${name} is empty.`, null, correlationId);
			return Response.error(clazz, method, `${name} is empty.`, null, null, null, correlationId);
		}

		return this._successResponse(null, correlationId);
	}

	_enforceNotNullAsResponse(clazz, method, value, name, correlationId) {
		if (!value) {
			this._logger.error(clazz, method, `${name} is null.`, null, correlationId);
			return Response.error(clazz, method, `${name} is null.`, null, null, null, correlationId);
		}

		return this._successResponse(null, correlationId);
	}

	_enforceResponse(clazz, method, response, name, correlationId, message) {
		if (!response || (response && !response.success)) {
			if (!String.isNullOrEmpty(message))
				message = `Unsuccessful response for ${name}.`;

			this._logger.error(clazz, method, message, null, correlationId);
			const error = Error(message, true);
			error.correlationId = correlationId;
			throw error;
		}
	}

	_error(clazz, method, message, err, code, errors, correlationId) {
		if (message)
			this._logger.error(clazz, method, message, null, correlationId);
		if (err)
			this._logger.exception(clazz, method, err, correlationId);
		if (code)
			this._logger.error(clazz, method, 'code', code, correlationId);
		if (errors) {
			for (const error of errors)
				this._logger.exception(clazz, method, error, correlationId);
		}
		return Response.error(clazz, method, message, err, code, errors, correlationId);
	}

	_hasFailed(response) {
		return Response.hasFailed(response);
	}

	_hasSucceeded(response) {
		return Response.hasSucceeded(response);
	}

	_initResponse(correlationId) {
		return new Response(correlationId);
	}

	_success(correlationId) {
		return Response.success(correlationId);
	}

	_successResponse(value, correlationId) {
		return Response.success(correlationId, value);
	}

	_validateId(correlationId, id, prefix) {
		if (String.isNullOrEmpty(id))
			return this._error('Service', '_validateId', 'Invalid id', null, null, null, correlationId);

		return this._serviceValidation.check(correlationId, this._serviceValidation.idSchema, id, null, prefix);
	}

	_warn(clazz, method, message, err, code, errors, correlationId) {
		if (message)
			this._logger.warn(clazz, method, message, null, correlationId);
		if (err)
			this._logger.warn(clazz, method, err.message, null, correlationId);
		if (code)
			this._logger.warn(clazz, method, 'code', code, correlationId);
		if (errors)
			this._logger.warn(clazz, method, null, errors, correlationId);
		return Response.error(clazz, method, message, err, code, errors, correlationId);
	}
}

export default Service;
