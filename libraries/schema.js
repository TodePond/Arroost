export const Schema = class {
	constructor({ check, make, diagnose } = {}) {
		this.check = check
		this.make = make
		this.diagnose = diagnose || ((value) => value)
	}

	validate(value) {
		if (!this.check(value)) {
			throw new Error(`Invalid value ^`)
		}
	}

	and(other) {
		return new Schema({
			check: (value) => this.check(value) && other.check(value),
			make: other.make || this.make,
			diagnose: (value) => {
				if (!this.check(value)) {
					return this.diagnose(value)
				}
				return other.diagnose(value)
			},
		})
	}

	or(other) {
		return new Schema({
			check: (value) => this.check(value) || other.check(value),
			make: this.make,
			diagnose: (value) => {
				if (!this.check(value)) {
					return this.diagnose(value)
				}
				return other.diagnose(value)
			},
		})
	}

	not() {
		return new Schema({
			check: (value) => !this.check(value),
		})
	}

	withMake(make) {
		return new Schema({
			check: this.check,
			make,
			diagnose: this.diagnose,
		})
	}

	withCheck(check) {
		return new Schema({
			check,
			make: this.make,
			diagnose: this.diagnose,
		})
	}

	andCheck(check) {
		return new Schema({
			check: (value) => this.check(value) && check(value),
			make: this.make,
			diagnose: this.diagnose,
		})
	}

	withDefault(defaultValue) {
		return new Schema({
			check: this.check,
			make: (value) => (value === undefined ? defaultValue : value),
			diagnose: this.diagnose,
		})
	}

	withDiagnose(diagnose) {
		return new Schema({
			check: this.check,
			make: this.make,
			diagnose,
		})
	}

	nullable() {
		return Schema.Null.or(this)
	}

	static reference(key) {
		return new Schema({
			check: (value) => this[key].check(value),
			make: (arg) => this[key].make(arg),
			diagnose: (value) => this[key].diagnose(value),
		})
	}
}

Schema.Number = new Schema().withDefault(0).withCheck((value) => typeof value === "number")
Schema.String = new Schema().withDefault("").withCheck((value) => typeof value === "string")
Schema.Boolean = new Schema().withDefault(false).withCheck((value) => typeof value === "boolean")

Schema.Array = new Schema({
	check: (value) => Array.isArray(value),
	make: (value) => value ?? [],
})

Schema.Tuple = (schemas) => {
	const check = (value) => {
		if (value.length !== schemas.length) {
			return false
		}
		for (const i in schemas) {
			if (!schemas[i].check(value[i])) {
				return false
			}
		}
		return true
	}

	const make = (args = []) => {
		const values = []
		for (let i = 0; i < schemas.length; i++) {
			values[i] = schemas[i].make(args[i])
		}
		return values
	}

	return Schema.Array.andCheck(check).withMake(make)
}

Schema.Object = new Schema({
	check: (value) => typeof value === "object" && !Schema.Array.check(value),
	make: (value) => value ?? {},
})

Schema.Function = new Schema({
	check: (value) => typeof value === "function",
	make: (value) => value ?? (() => {}),
})

Schema.Anything = new Schema().withCheck(() => true).withDefault(undefined)
Schema.Any = (schemas) => {
	const check = (value) => {
		for (const schema of schemas) {
			if (schema.check(value)) {
				return true
			}
		}
		return false
	}

	const make = (value) => {
		const [head] = schemas
		return head.make(value)
	}

	return new Schema({ check, make })
}

Schema.PartialStruct = (struct) => {
	const check = (value) => {
		for (const key in value) {
			if (!struct[key].check(value[key])) {
				return false
			}
		}
		return true
	}

	const make = (options = {}) => {
		const object = {}
		for (const key in struct) {
			const value = options[key]
			object[key] = struct[key].make(value)
		}
		for (const key in options) {
			if (struct[key] === undefined) {
				object[key] = options[key]
			}
		}
		return object
	}

	const diagnose = (value) => {
		for (const key in struct) {
			if (!struct[key].check(value[key])) {
				return [key, struct[key]?.diagnose?.(value[key])]
			}
		}
	}

	const schema = Schema.Object.andCheck(check).withMake(make).withDiagnose(diagnose)
	schema.struct = struct
	schema.extend = (other) => {
		const struct = { ...schema.struct, ...other }
		return Schema.BaseStruct(struct)
	}
	return schema
}

Schema.BaseStruct = (struct) => {
	const check = (value) => {
		for (const key in struct) {
			if (!struct[key].check(value[key])) {
				return false
			}
		}
		return true
	}

	const make = (options = {}) => {
		const object = {}
		for (const key in struct) {
			const value = options[key]
			object[key] = struct[key].make(value)
		}
		for (const key in options) {
			if (struct[key] === undefined) {
				object[key] = options[key]
			}
		}
		return object
	}

	const diagnose = (value) => {
		for (const key in struct) {
			if (!struct[key].check(value[key])) {
				return [key, struct[key]?.diagnose?.(value[key])]
			}
		}
	}

	const schema = Schema.Object.andCheck(check).withMake(make).withDiagnose(diagnose)
	schema.struct = struct
	schema.extend = (other) => {
		const struct = { ...schema.struct, ...other }
		return Schema.BaseStruct(struct)
	}
	return schema
}

Schema.Struct = (struct) => {
	const partial = Schema.BaseStruct(struct)
	const check = (value) => {
		for (const key in value) {
			if (!struct[key]) {
				return false
			}
		}
		return true
	}
	const schema = partial.andCheck(check)
	schema.struct = struct
	schema.base = () => Schema.BaseStruct(struct)
	schema.partial = () => Schema.PartialStruct(struct)
	schema.extend = (other) => {
		const struct = { ...schema.struct, ...other }
		return Schema.Struct(struct)
	}
	schema.combine = (other) => {
		const implementation = {}
		for (const key in struct) {
			if (other[key] === undefined) {
				implementation[key] = struct[key]
			} else {
				implementation[key] = struct[key].and(other[key])
			}
		}
		for (const key in other) {
			if (struct[key] === undefined) {
				implementation[key] = other[key]
			}
		}
		return Schema.Struct(implementation)
	}

	return schema
}

Schema.ArrayOf = (schema) => {
	const check = (value) => {
		for (const item of value) {
			if (!schema.check(item)) {
				return false
			}
		}
		return true
	}
	return Schema.Array.andCheck(check)
}

Schema.Enum = (values) => {
	const set = new Set(values)
	const check = (value) => {
		return set.has(value)
	}

	const [head] = values
	const schema = new Schema().withCheck(check).withDefault(head)
	schema.values = values
	return schema
}

Schema.Finite = Schema.Number.withCheck((value) => Number.isFinite(value))
Schema.Integer = Schema.Number.withCheck((value) => Number.isInteger(value))
Schema.SafeInteger = Schema.Number.withCheck((value) => Number.isSafeInteger(value))

Schema.Negative = Schema.Number.andCheck((value) => value <= 0)
Schema.Positive = Schema.Number.andCheck((value) => value >= 0)
Schema.PositiveInteger = Schema.Integer.and(Schema.Positive)
Schema.SafePositiveInteger = Schema.SafeInteger.and(Schema.Positive)

Schema.Vector2D = Schema.Tuple([Schema.Finite, Schema.Finite])
Schema.Vector3D = Schema.Tuple([Schema.Finite, Schema.Finite, Schema.Finite])

Schema.Truthy = new Schema().withCheck((value) => !!value).withDefault(true)
Schema.Falsy = new Schema().withCheck((value) => !value).withDefault(false)

Schema.Value = (value) => new Schema().withCheck((v) => v === value).withDefault(value)

Schema.True = Schema.Value(true)
Schema.False = Schema.Value(false)

Schema.Undefined = Schema.Value(undefined)
Schema.Null = Schema.Value(null)

Schema.ObjectWith = ({ keysOf = Schema.Anything, valuesOf = Schema.Anything } = {}) => {
	const stringKeysOf = Schema.Stringified(keysOf)
	const check = (value) => {
		for (const key in value) {
			if (!stringKeysOf.check(key) || !valuesOf.check(value[key])) {
				return false
			}
		}
		return true
	}
	const diagnose = (value) => {
		for (const key in value) {
			if (!stringKeysOf.check(key)) {
				return stringKeysOf.diagnose(key)
			}
			if (!valuesOf.check(value[key])) {
				return [key, valuesOf.diagnose(value[key])]
			}
		}
	}

	return Schema.Object.andCheck(check).withDiagnose(diagnose)
}

Schema.Stringified = (schema) => {
	const check = (value) => {
		try {
			return schema.check(JSON.parse(value))
		} catch (error) {
			return false
		}
	}

	const make = () => {
		return JSON.stringify(schema.make())
	}

	return new Schema({ check, make })
}
