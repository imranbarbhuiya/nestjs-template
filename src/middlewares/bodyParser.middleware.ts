// TODO(fastify): remove this
import { json, urlencoded } from 'express';

import type { NestMiddleware } from '@nestjs/common';

export class JSONBodyParserMiddleware implements NestMiddleware {
	public use = json({ limit: '50mb' });
}

export class URLEncodedBodyParserMiddleware implements NestMiddleware {
	public use = urlencoded({ extended: true });
}
