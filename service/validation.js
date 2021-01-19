import Service from './index';

class BaseValidationService extends Service {
	check(correlationId, schema, value, context, prefix) {
		return this._success(correlationId);
	}
}

export default BaseValidationService;
