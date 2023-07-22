import { MongoItemModule, MongoItemService } from '@app/mongoose';
import { Module } from '@nestjs/common';

import { ItemController } from './item.controller';
import { ItemService } from './item.service';

@Module({
	imports: [ItemModule, MongoItemModule],
	controllers: [ItemController],
	providers: [ItemService, MongoItemService],
})
export class ItemModule {}
