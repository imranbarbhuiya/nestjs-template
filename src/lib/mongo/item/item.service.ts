import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ItemSchemaName, type IItem } from '../schemas';

@Injectable()
export class MongoItemService {
	public constructor(
		@InjectModel(ItemSchemaName)
		private readonly model: Model<IItem>,
	) {}

	public async getSomething(): Promise<IItem | null> {
		return this.model.findOne({}).lean().exec();
	}
}
