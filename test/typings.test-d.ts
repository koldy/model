// Type tests for typings.d.ts, checked by "npm run test:types" (tsc only, this file is never executed).
// Every "@ts-expect-error" line must produce an error, otherwise tsc fails with "Unused '@ts-expect-error' directive".

import {AnyType, DateType, DefinitionType, Model, ModelDefinition, ObjectType, StringType} from 'koldy-model';

// --- must compile ---

class PlainModel extends Model {
	uuid: string | null;
	name?: string;
	createdAt: Date;

	definition(): ModelDefinition<PlainModel> {
		return {
			uuid: new StringType(),
			name: new StringType(),
			createdAt: new DateType()
		};
	}
}

// generic models use the default type arguments: ModelDefinition<GenericModel<T>> can't be resolved inside the class
class GenericModel<T = {[p: string]: any}> extends Model {
	__: T;

	definition(): ModelDefinition<GenericModel> {
		return {
			__: new ObjectType()
		};
	}
}

class ChildModel extends PlainModel {
	extra: string;

	definition(): ModelDefinition<ChildModel> {
		return {
			...super.definition(),
			extra: new StringType()
		};
	}
}

// function-typed fields may be left out of definition()
class FormatterModel extends Model {
	uuid: string;
	formatter?: (value: string) => string;

	definition(): ModelDefinition<FormatterModel> {
		return {
			uuid: new StringType()
		};
	}
}

// ... or be declared there
class DeclaredFormatterModel extends Model {
	uuid: string;
	formatter?: (value: string) => string;

	definition(): ModelDefinition<DeclaredFormatterModel> {
		return {
			uuid: new StringType(),
			formatter: new AnyType()
		};
	}
}

class AnyFieldModel extends Model {
	meta: any;

	definition(): ModelDefinition<AnyFieldModel> {
		return {
			meta: new AnyType()
		};
	}
}

const plain = PlainModel.create<PlainModel>({uuid: 'a'});
const definition: DefinitionType = plain.definition();

// --- must not compile ---

class MissingFieldModel extends Model {
	uuid: string;
	name: string;

	definition(): ModelDefinition<MissingFieldModel> {
		// @ts-expect-error "name" is missing
		return {
			uuid: new StringType()
		};
	}
}

class ExtraKeyModel extends Model {
	uuid: string;

	definition(): ModelDefinition<ExtraKeyModel> {
		return {
			uuid: new StringType(),
			// @ts-expect-error "name" is not a field of the class
			name: new StringType()
		};
	}
}

class RenamedKeyModel extends Model {
	entity: string;

	definition(): ModelDefinition<RenamedKeyModel> {
		return {
			// @ts-expect-error the class has "entity", not "entityId"
			entityId: new StringType()
		};
	}
}

class ExtraKeyNextToSpreadModel extends PlainModel {
	definition(): ModelDefinition<ExtraKeyNextToSpreadModel> {
		return {
			...super.definition(),
			// @ts-expect-error "extra" is not a field of the class
			extra: new StringType()
		};
	}
}
