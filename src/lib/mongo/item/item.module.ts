import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoItemService } from './item.service';

import { ItemSchemaName, ItemSchema } from '../schemas';

@Module({
	imports: [MongooseModule.forFeature([{ name: ItemSchemaName, schema: ItemSchema }])],
	exports: [MongoItemService, MongooseModule.forFeature([{ name: ItemSchemaName, schema: ItemSchema }])],
	providers: [MongoItemService],
})
export class MongoItemModule {}
