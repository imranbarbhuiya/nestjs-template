import { Injectable, Logger } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

// import { AuthService } from '../auth.service';

const logger = new Logger('SessionSerializer');

@Injectable()
export class SessionSerializer extends PassportSerializer {
	public constructor() { // private readonly authService: AuthService
		super();
	}

	public serializeUser(user: { id: string; registered?: boolean }, done: (error: any, data: {} | null) => void) {
		done(null, 'registered' in user ? null : user.id);
	}

	public async deserializeUser(id: string, done: (error: any, data: {} | null) => void) {
		try {
			const user = await Promise.resolve({ id });
			done(null, user);
		} catch (error) {
			logger.error(error);
			done(error, null);
		}
	}
}
