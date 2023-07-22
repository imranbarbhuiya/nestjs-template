import { Injectable, Logger } from '@nestjs/common';

import type { NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private logger = new Logger('HTTP');

	public use(request: Request, response: Response, next: NextFunction): void {
		const { method, originalUrl, user } = request;

		response.on('finish', () => {
			const { statusCode } = response;
			const contentLength = response.get('content-length');

			this.logger.log(
				`${`\u001B[95m${method}\u001B[39m`} ${`\u001B[96m${statusCode}\u001B[39m`} ${originalUrl} ${
					contentLength ?? ''
				} | ${user ? user.id : ''}`,
			);
		});

		next();
	}
}
