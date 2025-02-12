import { Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';

// import { AuthenticatedGuard } from '../auth/guard';

@ApiTags('User')
@Controller()
export class UserController {
	public constructor(private readonly userService: UserService) {}

	// @UseGuards(AuthenticatedGuard)
	@ApiResponse({
		status: 200,
		description: 'Endpoint to verify quarantine user',
	})
	@Post('verify')
	public verifyQuaUser() {
		return this.userService;
	}
}
