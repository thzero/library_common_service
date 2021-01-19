import Service from './index';

class BaseMonitoringService extends Service {
	async init(injector) {
		super.init(injector);

		this._initialize();
	}

	check(correlationId, name, status, options, tags, callback) {
	}

	decrement(correlationId, stat, value, sampleRate, tags, callback) {
	}

	distribution(correlationId, stat, value, sampleRate, tags, callback) {
	}

	event(correlationId, title, text, options, tags, callback) {
	}

	gauge(correlationId, stat, value, sampleRate, tags, callback) {
	}

	histogram(correlationId, stat, value, sampleRate, tags, callback) {
	}

	increment(correlationId, stat, value, sampleRate, tags, callback) {
	}

	set(correlationId, stat, value, sampleRate, tags, callback) {
	}

	unique(correlationId, stat, value, sampleRate, tags, callback) {
	}

	_handleCpu(correlationId, process, system) {
		if (process)
			this.gauge('cpu.process', process);
		if (system)
			this.gauge('cpu.system', system);
	}

	_handleEventLoop(correlationId, min, max, avg) {
		if (min)
			this.gauge('eventloop.latency.min', min);
		if (max)
			this.gauge('eventloop.latency.max', max);
		if (avg)
			this.gauge('eventloop.latency.avg', avg);
	}

	_handleGC(correlationId, size, used, duration) {
		if (size)
			this.gauge('gc.size', size);
		if (used)
			this.gauge('gc.used', used);
		if (duration)
			this.gauge('gc.duration', duration);
	}

	_handleMemory(correlationId, privateProcess, physical, virtual, physical_used, total) {
		if (privateProcess)
			this.gauge('memory.process.private', privateProcess);
		if (physical)
			this.gauge('memory.process.physical', physical);
		if (virtual)
			this.gauge('memory.process.virtual', virtual);
		if (physical_used)
			this.gauge('memory.system.used', physical_used);
		if (total)
			this.gauge('memory.system.total', total);
	}

	_initialize() {
	}
}

export default BaseMonitoringService;
