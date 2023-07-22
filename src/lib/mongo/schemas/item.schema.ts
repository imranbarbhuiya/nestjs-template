import { Schema, SchemaTypes, type InferSchemaType } from 'mongoose';

export const ItemSchemaName = 'Item';

export const ItemSchema = new Schema(
	{
		id: {
			type: SchemaTypes.Number,
		},
	},
	{ timestamps: true },
);

export type IItem = InferSchemaType<typeof ItemSchema>;
