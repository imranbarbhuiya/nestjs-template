import process from 'node:process';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, patchNestjsSwagger } from '@zod';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import passport from 'passport';

import { AppModule } from './app.module';

const envService = new ConfigService();
const logger = new Logger();

async function bootstrap() {
	logger.log('Starting Web API...');
	const app = await NestFactory.create(AppModule, {
		rawBody: true,
		cors: {
			origin: [
				'https://www.roti.xyz',
				process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://roti.xyz',
			],
			credentials: true,
		},
		bodyParser: false,
	});
	app.useGlobalPipes(new ZodValidationPipe());
	app.use(
		session({
			secret:
				"Fj5C:y27SB6qqY9S>_KA?~H{(mUEd5*Xwmqt+Y{)3:,_Z+dCqg,jR!,]_z,Y`H{K*,}w$-djH5d5F':_KEx]TNL.Qv5MnMh]a;3N=x:qE<2]vn}[=hj+S69!8[MQ9B`1",
			cookie: {
				maxAge: 60_000 * 60 * 24 * 7,
				// secure: process.env.NODE_ENV === 'production',
				// httpOnly: true,
				// domain: process.env.NODE_ENV === 'production' ? '.roti.xyz' : 'localhost',
			},
			resave: false,
			saveUninitialized: false,
			store: MongoStore.create({
				mongoOptions: {
					minPoolSize: 10,
					connectTimeoutMS: 30_000,
					socketTimeoutMS: 30_000 * 3,
					family: 4,
					serverSelectionTimeoutMS: 30_000,
					heartbeatFrequencyMS: 1_500,
				},
				mongoUrl: process.env.DB_URI,
			}),
		}),
	);

	app.use(passport.initialize());
	app.use(passport.session());

	const PORT = envService.getOrThrow('PORT');

	if (process.env.NODE_ENV === 'development' && envService.get('DISABLE_SWAGGER') !== 'true') {
		patchNestjsSwagger();
		const config = new DocumentBuilder()
			.setTitle('Web Backend')
			.setDescription('Backend api of roti site')
			.setVersion('1.0')
			.build();

		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup('docs', app, document);
		logger.log(`Swagger is running on http://localhost:${PORT}/docs`);
	}

	await app.listen(PORT);
	logger.log(`Application is listening on http://localhost:${PORT}`);
}

void bootstrap();
