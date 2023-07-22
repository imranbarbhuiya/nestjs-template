import process from 'node:process';

import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Next } from '@nestjs/common/decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { AuthenticatedGuard, DiscordGuard } from './guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	@ApiResponse({
		status: 200,
		description: 'Endpoint to login using discord',
	})
	@Get('/discord')
	public login(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction, @Query('next') state: string) {
		// This doesn't uses decorators because I can't get the state to work
		if (!req.user) passport.authenticate('discord', { prompt: 'none', state })(req, res, next);
		return req.user;
	}

	@UseGuards(DiscordGuard)
	@ApiResponse({
		status: 200,
		description: 'Endpoint to login using discord',
	})
	@Get('/discord/redirect')
	public loginRedirect(@Query('state') state: string, @Res() res: Response) {
		if (state) {
			res.redirect(`${process.env.MAIN_URL}/${state}`);
			return;
		}

		res.redirect(process.env.MAIN_URL);
	}

	@UseGuards(AuthenticatedGuard)
	@ApiResponse({
		status: 200,
		description: 'Endpoint to login using discord',
	})
	@Get()
	public verifyLogin(@Req() req: Request) {
		return { user: req.user };
	}

	@UseGuards(AuthenticatedGuard)
	@Get('logout')
	public logout(@Req() req: Request) {
		req.logOut({ keepSessionInfo: false }, () => null);
	}
}
