import { Injectable } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';

import type { ExecutionContext } from '@nestjs/common';
import type { CanActivate } from '@nestjs/common/interfaces';
import type { Request } from 'express';

@Injectable()
export class DiscordGuard extends AuthGuard('discord') {
	public override async canActivate(context: ExecutionContext): Promise<boolean> {
		const result = (await super.canActivate(context)) as boolean;
		await super.logIn(context.switchToHttp().getRequest<Request>());
		return result;
	}
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
	public canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest<Request>();
		return req.isAuthenticated();
	}
}
