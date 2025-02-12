import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory';

import { zodTypeToOpenApi } from './zodTypeToOpenApi';

export const patchNestjsSwagger = () => {
	// @ts-expect-error - patched property
	if (SchemaObjectFactory.prototype.__zodDtoPatched) return;

	const orgExploreModelSchema = SchemaObjectFactory.prototype.exploreModelSchema;

	SchemaObjectFactory.prototype.exploreModelSchema = function exploreModelSchema(type, schemas, schemaRefsStack) {
		let typeValue = type as unknown as { name: string; zodSchema: any };
		if (this['isLazyTypeFunc'](typeValue)) typeValue = (type as Function)();

		if (!typeValue.zodSchema) return orgExploreModelSchema.call(this, typeValue, schemas, schemaRefsStack);

		const openApiDef = zodTypeToOpenApi(typeValue.zodSchema);

		schemas[typeValue.name] = openApiDef as (typeof schemas)[string];

		return typeValue.name;
	};

	// @ts-expect-error - patched property
	SchemaObjectFactory.prototype.__zodDtoPatched = true;
};
