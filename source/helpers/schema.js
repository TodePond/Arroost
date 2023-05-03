export const Schema = class {
	constructor({ check, make } = {}) {
		this.check = check
		this.make = make
	}

	and(other) {
		return new Schema({
			check: (value) => this.check(value) && other.check(value),
			make: other.make,
		})
	}

	or(other) {
		return new Schema({
			check: (value) => this.check(value) || other.check(value),
			make: this.make,
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
		})
	}

	withCheck(check) {
		return new Schema({
			check,
			make: this.make,
		})
	}

	andCheck(check) {
		return new Schema({
			check: (value) => this.check(value) && check(value),
			make: this.make,
		})
	}

	withDefault(defaultValue) {
		return new Schema({
			check: this.check,
			make: () => defaultValue,
		})
	}

	nullable() {
		return this.or(Schema.Null)
	}
}

Schema.Number = new Schema({
	check: (value) => typeof value === "number",
	make: () => 0,
})

Schema.String = new Schema({
	check: (value) => typeof value === "string",
	make: () => "",
})

Schema.Boolean = new Schema({
	check: (value) => typeof value === "boolean",
	make: () => false,
})

Schema.Array = new Schema({
	check: (value) => Array.isArray(value),
	make: () => [],
})

Schema.Object = new Schema({
	check: (value) => typeof value === "object" && !Schema.Array.check(value),
	make: () => ({}),
})

Schema.Function = new Schema({
	check: (value) => typeof value === "function",
	make: () => () => {},
})

Schema.Null = new Schema({
	check: (value) => value === null,
	make: () => null,
})

Schema.Any = new Schema({
	check: () => true,
	make: () => undefined,
})

Schema.Struct = (struct) => {
	const check = (value) => {
		for (const key in struct) {
			if (!struct[key].check(value[key])) {
				return false
			}
		}
		return true
	}

	const make = () => {
		const object = {}
		for (const key in struct) {
			object[key] = struct[key].make()
		}
		return object
	}

	return Schema.Object.andCheck(check).withMake(make)
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
	const make = () => {
		return head
	}

	return new Schema({ check, make })
}

Schema.Vector2D = Schema.Struct({
	[0]: Schema.Number,
	[1]: Schema.Number,
})

Schema.Vector3D = Schema.Struct({
	[0]: Schema.Number,
	[1]: Schema.Number,
	[2]: Schema.Number,
})

Schema.Integer = Schema.Number.withCheck((value) => Number.isInteger(value))
Schema.Positive = Schema.Number.andCheck((value) => value >= 0)
Schema.PositiveInteger = Schema.Integer.and(Schema.Positive)

Schema.Undefined = new Schema({
	check: (value) => value === undefined,
	make: () => undefined,
})

Schema.Truthy = new Schema({
	check: (value) => !!value,
	make: () => true,
})

Schema.Falsy = new Schema({
	check: (value) => !value,
	make: () => false,
})

Schema.ObjectWith = ({ keysOf = Schema.Any, valuesOf = Schema.Any } = {}) => {
	const check = (value) => {
		for (const key in value) {
			if (!keysOf.check(key) || !valuesOf.check(value[key])) {
				return false
			}
		}
		return true
	}

	return Schema.Object.andCheck(check)
}
