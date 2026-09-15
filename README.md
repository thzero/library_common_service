![GitHub package.json version](https://img.shields.io/github/package-json/v/thzero/library_common_service)
![David](https://img.shields.io/david/thzero/library_common_service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# library_common_service

The service layer shared by the server and client frameworks — the `Service`
base class every service extends, and the abstract config, logger, validation
and monitoring services.

Sits between [@thzero/library_common](https://github.com/thzero/library_common),
which it depends on, and `library_server` / `library_client`, which depend on it.
Nothing here is server-specific.

## Requirements

### NodeJs

[NodeJs](https://nodejs.org) version 22+

### Installation

[![NPM](https://nodei.co/npm/@thzero/library_common_service.png?compact=true)](https://npmjs.org/package/@thzero/library_common_service)

```
npm install @thzero/library_common_service
```

#### Peer dependencies

* `@thzero/library_common`

No direct dependencies of its own.

## What it provides

### `service/index.js` — `Service`

The base every service extends. `init(injector)` resolves `SERVICE_CONFIG`,
`SERVICE_LOGGER` and `SERVICE_VALIDATION` onto `this._config`, `this._logger` and
`this._serviceValidation`, so a subclass has them without asking.

| Group | Members |
|---|---|
| Lifecycle | `init(injector)`, `initPost()` |
| Responses | `_success`, `_successResponse`, `_error`, `_errorResponse`, `_warn`, `_initResponse` |
| Response tests | `_hasFailed`, `_hasSucceeded` |
| Enforcement | `_enforce`, `_enforceNotNull`, `_enforceNotEmpty`, and the `Either`, `Multiple` and `Response` variants of each |
| Misc | `_checkUpdatedTimestamp`, `_validateId` |

`Repository` in `library_server` carries the same enforcement and response
helpers, deliberately — a repository is not a service but needs the same
vocabulary.

**The `_enforce*` family throws.** Use it for invariants a caller cannot
legitimately violate, not for user input — user input belongs in a validation
schema, which returns a failed response instead.

The `_enforceNotNullResponse` and `_enforceNotEmptyResponse` variants return a
response rather than throwing, for where a caller wants to decide.

### `service/config.js` — `ConfigService`

`get(path, fallback)` reads a dotted path out of the application configuration.
`library_server` extends it with `getBackend(correlationId, key)`.

### `service/logger.js` — `LoggerService`

A fan-out logger, not a logging implementation. `register(key)` adds an injector
key to the list; `init` resolves each and calls `initLogger(logLevel, prettify,
configLogging)` on it. Every level — `debug`, `error`, `exception`, `fatal`,
`info`, `trace`, `warn`, their `2` variants and `raw` — is forwarded to all of
them.

A throw from one logger is caught and written to `console.error`, so a broken
logger cannot take down the application or silence the others.

The concrete loggers are
[library_server_logger_pino](https://github.com/thzero/library_server_logger_pino)
and
[library_server_logger_winston](https://github.com/thzero/library_server_logger_winston).

Level and prettify come from the `logging` config block, overridden by the
`LOG_LEVEL` and `LOG_PRETTIFY` environment variables.

### `service/validation.js` — `BaseValidationService`

**Abstract.** `check(correlationId, schema, value, context, prefix)` returns
success unconditionally on the base. Implemented by
[library_server_validation_joi](https://github.com/thzero/library_server_validation_joi).

### `service/monitoring.js` — `BaseMonitoringService`

**Abstract.** The metrics surface: `check`, `increment`, `decrement`, `gauge`,
`histogram`, `distribution`, `set`, `unique`, `event`, plus the `_handleCpu`,
`_handleEventLoop`, `_handleGC` and `_handleMemory` hooks a subclass fills in.
`library_server` registers a `NullMonitoringService` by default.

### `constants.js`

```js
InjectorKeys: {
    SERVICE_CONFIG:     'serviceConfig',
    SERVICE_LOGGER:     'serviceLogger',
    SERVICE_MONITORING: 'serviceMonitoring',
    SERVICE_VALIDATION: 'serviceValidation'
}
```

These four are separate from the keys in `library_server/constants.js` — they are
the ones every `Service` and `Repository` resolves for itself during `init`, on
either side of the stack.

## Configuration

No configuration of its own. `ConfigService` reads whatever the application
supplies, and `LoggerService` reads the `logging` block:

```json
{
    "app": {
        "logging": {
            "level": "debug",
            "prettify": false
        }
    }
}
```

## Wiring it up

Extend `Service` for your own services:

```js
import Service from '@thzero/library_common_service/service/index.js';

class InventoryService extends Service {
    async init(injector) {
        await super.init(injector);
        this._repositoryInventory = injector.getService(AppConstants.InjectorKeys.REPOSITORY_INVENTORY);
    }

    async fetch(correlationId, id) {
        this._enforceNotEmpty('InventoryService', 'fetch', id, 'id', correlationId);
        return await this._repositoryInventory.fetch(correlationId, id);
    }
}
```

Always `await super.init(injector)` first — `this._config` and `this._logger` are
not there until it has run.

Registration happens through the host framework: `_initServices` on
`library_server`'s `BootMain`, or a boot plugin's `initServices`.

## Development

```
npm run lint       # eslint .
npm run lint:fix   # eslint . --fix
npm test           # node --test "test/*.test.js"
```
