import {
	ZodArray,
	ZodBigInt,
	ZodBoolean,
	ZodDefault,
	ZodEnum,
	ZodLiteral,
	ZodNativeEnum,
	ZodNullable,
	ZodNumber,
	ZodObject,
	ZodOptional,
	ZodString,
	ZodTransformer,
	ZodTuple,
	ZodUnion,
	type ZodTypeAny,
	type ZodTypeDef,
} from 'zod';

import type { ApiPropertyOptions } from '@nestjs/swagger';

export interface OpenApiBuilderProperties {
	description?: string;
	example?: unknown;
	format?: string;
	type?: string;
}

export interface ZodTypeDefOpenApi extends ZodTypeDef {
	openApi: OpenApiBuilderProperties;
}

export const zodTypeToOpenApi = (zodType: ZodTypeAny): ApiPropertyOptions => {
	const zodDef = zodType._def;

	const openApiElement = (element: ApiPropertyOptions): ApiPropertyOptions => {
		return {
			required: true,
			...element,
			...(zodDef as ZodTypeDefOpenApi).openApi,
			description: zodType.description,
		};
	};

	switch (zodType.constructor.name) {
		case ZodObject.name: {
			const shape = zodDef.shape();
			const shapeKeys = Object.keys(shape);
			const properties: Record<string, any> = {};

			for (const key of shapeKeys) {
				const propZodType = shape[key];

				properties[key] = zodTypeToOpenApi(propZodType);
			}

			return openApiElement({
				type: 'object',
				properties,
				description: zodDef.description,
			});
		}

		case ZodDefault.name:
		case ZodOptional.name: {
			return openApiElement({
				...zodTypeToOpenApi(zodDef.innerType),
				required: false,
			});
		}

		case ZodNullable.name: {
			return openApiElement({
				...zodTypeToOpenApi(zodDef.innerType),
				nullable: true,
			});
		}

		case ZodTransformer.name: {
			return openApiElement({
				...zodTypeToOpenApi(zodDef.schema),
			});
		}

		case ZodEnum.name: {
			const enumValues = Object.values(zodDef.values);

			return openApiElement({
				type: typeof enumValues[0],
				enum: enumValues,
				example: enumValues.map((value) => `'${value}'`).join(' | '),
			});
		}

		case ZodNativeEnum.name: {
			const enumValues = zodDef.values;

			return openApiElement({
				type: typeof enumValues[0],
				enum: Object.values(enumValues),
				// @ts-expect-error x-enumNames is not typed
				'x-enumNames': Object.keys(enumValues),
			});
		}

		case ZodLiteral.name: {
			const { value } = zodDef;

			return openApiElement({
				type: 'string',
				enum: [value],
			});
		}

		case ZodUnion.name: {
			const { options } = zodDef;

			return openApiElement({
				oneOf: options.map((item: ZodTypeAny) => zodTypeToOpenApi(item)),
			} as unknown as ApiPropertyOptions);
		}

		case ZodTuple.name: {
			// Switch to OpenAPI 3.1 once supported by swagger ui https://stackoverflow.com/questions/57464633/

			const { items } = zodDef;

			return openApiElement({
				type: 'array',
				items: {
					oneOf: items.map((item: ZodTypeAny) => zodTypeToOpenApi(item)),
				},
				minItems: items.length,
				maxItems: items.length,
			});
		}

		case ZodArray.name: {
			const { type } = zodDef;

			const items: any = type ? zodTypeToOpenApi(type) : {};

			return openApiElement({
				type: 'array',
				items,
			});
		}

		case ZodBigInt.name: {
			return openApiElement({
				type: 'integer',
				format: 'int64',
			});
		}

		case ZodString.name: {
			return openApiElement({
				type: 'string',
			});
		}

		case ZodNumber.name: {
			return openApiElement({
				type: 'number',
			});
		}

		case ZodBoolean.name: {
			return openApiElement({
				type: 'boolean',
			});
		}

		default: {
			return openApiElement({
				type: zodType.constructor.name.replace('Zod', '').toLowerCase(),
			});
		}
	}
};
