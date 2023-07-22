import process from 'node:process';

import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Scope, type Profile } from '@oauth-everything/passport-discord';

// import { AuthService } from '../auth.service';

const logger = new Logger('DiscordStrategy');
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
	public constructor() {
		// private readonly authService: AuthService
		super({
			clientID: process.env.DASHBOARD_CLIENT_ID,
			clientSecret: process.env.DASHBOARD_CLIENT_SECRET,
			callbackURL: process.env.DASHBOARD_CALLBACK_URL,
			scope: [Scope.IDENTIFY, Scope.EMAIL],
		});
	}

	public async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<any> {
		const { id, username, avatar, email } = profile._json;
		try {
			// const user = await this.authService.findUser(id);
			// return user ? { ...user } : { registered: false };
			return await Promise.resolve({ id, username, avatar, email });
		} catch (error) {
			logger.error(error);
			return null;
		}
	}
}
