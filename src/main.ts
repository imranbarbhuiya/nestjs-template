import process from 'node:process';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

import { ZodValidationPipe, patchNestjsSwagger } from '#zod';

const envService = new ConfigService();
const logger = new Logger();

async function bootstrap() {
	logger.log('Starting Web API...');
	const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
		cors: {
			origin: [
				'https://www.example.com',
				process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://example.com',
			],
			credentials: true,
		},
	});
	app
		.getHttpAdapter()
		.getInstance()
		.addHook('onRequest', (request: any, reply: any, done: any) => {
			reply.setHeader = function setHeader(key: any, value: any) {
				return this.raw.setHeader(key, value);
			};
			reply.end = function end() {
				this.raw.end();
			};
			request.res = reply;
			done();
		});
	app.use(helmet());
	app.useGlobalInterceptors();
	app.useGlobalPipes(new ZodValidationPipe());

	const PORT = envService.getOrThrow('PORT');

	if (process.env.NODE_ENV === 'development' && envService.get('DISABLE_SWAGGER') !== 'true') {
		patchNestjsSwagger();
		const config = new DocumentBuilder()
			.setTitle('Web Backend')
			.setDescription('Backend api template with nestjs')
			.setVersion('1.0')
			.build();

		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('docs', app, document);
		logger.log(`Swagger is running on http://localhost:${PORT}/docs`);
	}

	await app.listen(PORT, '0.0.0.0');
	logger.log(`Application is listening on http://localhost:${PORT}`);
}

void bootstrap();
