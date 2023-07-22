import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ItemService } from './item.service';

@ApiTags('Item')
@Controller('item')
export class ItemController {
	public constructor(private readonly ItemService: ItemService) {}

	@ApiResponse({
		status: 200,
		description: 'Endpoint to get all the top guilds',
	})
	@Get()
	public getSomething() {
		return this.ItemService.getSomething();
	}
}
