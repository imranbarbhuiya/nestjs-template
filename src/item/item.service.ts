import { Injectable } from '@nestjs/common';

import { MongoItemService } from '../lib/mongo';

@Injectable()
export class ItemService {
	public constructor(private readonly itemsService: MongoItemService) {}

	public getSomething() {
		return this.itemsService.getSomething();
	}
}
