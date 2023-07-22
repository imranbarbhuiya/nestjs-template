import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DiscordStrategy } from './strategy/discord.strategy';
import { SessionSerializer } from './strategy/session.serialize';

// import { MongoUserModule, MongoUserService } from '#app/mongoose';

@Module({
	imports: [
		// MongoUserModule,
		PassportModule.register({
			session: true,
			property: 'user',
			defaultStrategy: 'discord',
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		DiscordStrategy,
		// MongoUserService,
		SessionSerializer,
	],
})
export class AuthModule {}
