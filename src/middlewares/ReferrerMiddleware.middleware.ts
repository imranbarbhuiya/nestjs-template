import process from 'node:process';

import type { NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export class ReferrerMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const referrer = req.header('Referer');
		if (process.env.NODE_ENV === 'production' && !referrer?.startsWith(process.env.MAIN_URL)) {
			res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
			return;
		}

		next();
	}
}
