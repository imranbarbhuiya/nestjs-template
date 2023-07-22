import process from 'node:process';

import { Module, Logger, type MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { STATES } from 'mongoose';

import { AuthModule } from './auth/auth.module';
import { ItemModule } from './item/item.module';
import { JSONBodyParserMiddleware, URLEncodedBodyParserMiddleware } from './middlewares/bodyParser.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UserModule } from './user/user.module';

import type { Connection } from 'mongoose';

const logger = new Logger('AppModule');
@Module({
	imports: [
		AuthModule,
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		ItemModule,
		MongooseModule.forRoot(process.env.DB_URI, {
			connectionFactory: (connection: Connection) => {
				connection.on('connected', () => {
					logger.log('DB connected');
				});
				connection.on('disconnected', () => {
					logger.log('DB disconnected');
				});
				connection.on('error', (error) => {
					logger.log(`DB connection failed! Error: ${error}`);
				});

				logger.log(`DB ${STATES[connection.readyState]}`);
				return connection;
			},
		}),
		UserModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {
	public configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware, JSONBodyParserMiddleware, URLEncodedBodyParserMiddleware).forRoutes('*');
	}
}
