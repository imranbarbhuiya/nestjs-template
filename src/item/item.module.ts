import { Module } from '@nestjs/common';

import { ItemController } from './item.controller';
import { ItemService } from './item.service';

import { MongoItemModule, MongoItemService } from '#app/mongoose';

@Module({
	imports: [ItemModule, MongoItemModule],
	controllers: [ItemController],
	providers: [ItemService, MongoItemService],
})
export class ItemModule {}
