import { Buffer } from 'node:buffer';

import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';

import type { FastifyReply, FastifyRequest } from 'fastify';

const loggerColumnWidths = {
	method: 6,
	status: 3,
	route: 70,
	userId: 20,
	ip: 10,
	time: 15,
};

const loggerColors = {
	methods: {
		GET: '\u001B[94m',
		POST: '\u001B[92m',
		PUT: '\u001B[93m',
		DELETE: '\u001B[91m',
		PATCH: '\u001B[96m',
		DEFAULT: '\u001B[95m',
	},
	statuses: {
		success: '\u001B[92m',
		redirect: '\u001B[93m',
		clientError: '\u001B[91m',
		serverError: '\u001B[95m',
		default: '\u001B[97m',
	},
	reset: '\u001B[39m',
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private logger = new Logger('HTTP');

	public use(req: FastifyRequest, res: FastifyReply['raw'], next: () => void) {
		const { method, originalUrl } = req;
		if (method === 'OPTIONS') return next();
		const ip = req.headers['CF-Connecting-IP'] as string | undefined;
		const userId = req.headers['x-userid'] ?? '-';
		const now = Date.now();

		let responseBody = '';
		const originalWrite = res.write;
		const originalEnd = res.end;

		// Only intercept if status will be 400
		res.write = function write(chunk: any, ...args: any[]) {
			if (res.statusCode === 400) responseBody += chunk instanceof Buffer ? chunk.toString() : chunk;

			return originalWrite.call(this, chunk, ...args);
		};

		res.end = function end(chunk: any, ...args: any[]) {
			if (res.statusCode === 400 && chunk) responseBody += chunk instanceof Buffer ? chunk.toString() : chunk;

			return originalEnd.call(this, chunk, ...args);
		};

		res.on('finish', async () => {
			const { statusCode } = res;
			const time = Date.now() - now;

			const methodColor = loggerGetMethodColor(method);
			const statusColor = loggerGetStatusColor(statusCode);
			const truncatedRoute = truncateLoggerRoute(originalUrl);

			const logMessage = [
				` | ${methodColor}${padLogger(method, loggerColumnWidths.method)}${loggerColors.reset}`,
				`${statusColor}${padLogger(statusCode, loggerColumnWidths.status)}${loggerColors.reset}`,
				padLogger(truncatedRoute, loggerColumnWidths.route),
				padLogger(userId as string, loggerColumnWidths.userId),
				padLogger(
					(req.headers['x-request-origin'] as string | undefined) + ' | ' + (ip as string),
					loggerColumnWidths.ip,
				),
				padLogger(`${time}ms`, loggerColumnWidths.time),
			].join(' | ');

			this.logger.log(logMessage);

			if (statusCode === 400) console.error(responseBody);
		});

		next();
	}
}

function padLogger(text: string | number, length: number) {
	return text.toString().padEnd(length, ' ');
}

type LoggerHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
function loggerGetMethodColor(method: string): string {
	return loggerColors.methods[method as LoggerHttpMethod] || loggerColors.methods.DEFAULT;
}

function loggerGetStatusColor(status: number): string {
	if (status >= 200 && status < 300) return loggerColors.statuses.success;
	if (status >= 300 && status < 400) return loggerColors.statuses.redirect;
	if (status >= 400 && status < 500) return loggerColors.statuses.clientError;
	if (status >= 500) return loggerColors.statuses.serverError;
	return loggerColors.statuses.default;
}
function truncateLoggerRoute(route: string) {
	return route.length > 68 ? `${route.slice(0, 68 - 3)}...` : route;
}
