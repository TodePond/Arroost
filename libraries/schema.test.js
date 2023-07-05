import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import { Schema } from "./schema.js"

const S = Schema

describe("schema types", () => {
	it("does numbers", () => {
		const number = S.Number.make()
		assertEquals(number, 0)
		S.Number.validate(number)
	})

	it("does strings", () => {
		const string = S.String.make()
		assertEquals(string, "")
		S.String.validate(string)
	})

	it("does booleans", () => {
		const boolean = S.Boolean.make()
		assertEquals(boolean, false)
		S.Boolean.validate(boolean)
	})

	it("does arrays", () => {
		const array = S.Array.make()
		assertEquals(array, [])
		S.Array.validate(array)
	})

	it("does tuples", () => {
		const schema = S.Tuple([S.Number, S.String])
		const tuple = schema.make()
		assertEquals(tuple, [0, ""])
		schema.validate(tuple)
		assertThrows(() => schema.validate([0, 1]))
		assertThrows(() => schema.validate([0, "1", 2]))
	})

	it("does objects", () => {
		const object = S.Object.make()
		assertEquals(object, {})
		S.Object.validate(object)
	})

	it("does functions", () => {
		const func = S.Function.make()
		assertEquals(func.toString(), "() => {}")
		S.Function.validate(func)
	})

	it("does nulls", () => {
		const _null = S.Null.make()
		assertEquals(_null, null)
		S.Null.validate(_null)
	})

	it("does anythings", () => {
		const any = S.Anything.make()
		assertEquals(any, undefined)
		S.Anything.validate(any)
	})

	it("does anys", () => {
		const schema = S.Any([S.Number, S.String])
		const any = schema.make()
		assertEquals(any, 0)
		schema.validate(any)
		schema.validate("hello")
		assertThrows(() => schema.validate(false))
	})

	it("does base structs", () => {
		const schema = S.BaseStruct({
			name: S.String,
			age: S.Number,
		})
		const partial = schema.make()
		assertEquals(partial, { name: "", age: 0 })
		schema.validate(partial)
		schema.validate({ name: "Luke", age: 29, score: 10 })
	})

	it("does partial structs", () => {
		const schema = S.PartialStruct({
			name: S.String,
			age: S.Number,
		})
		const partial = schema.make()
		assertEquals(partial, { name: "", age: 0 })
		schema.validate(partial)
		schema.validate({ name: "Luke" })
		assertThrows(() => schema.validate({ name: "Luke", age: 29, score: 10 }))
	})

	it("does structs", () => {
		const schema = S.Struct({
			name: S.String,
			age: S.Number,
		})
		const struct = schema.make()
		assertEquals(struct, { name: "", age: 0 })
		schema.validate(struct)
		assertThrows(() => schema.validate({ name: "Luke", age: 29, score: 10 }))
	})

	it("extends structs", () => {
		const schema = S.Struct({ name: S.String })
		const extended = schema.extend({ age: S.Number })
		const struct = extended.make()
		assertEquals(struct, { name: "", age: 0 })
		extended.validate(struct)
		assertThrows(() => extended.validate({ name: "Luke", age: 29, score: 10 }))
		assertThrows(() => extended.validate({ name: "Luke" }))
	})

	it("combines structs", () => {
		const schema = S.Struct({ name: S.String, score: S.Integer })
		const implemented = schema.combine({ score: S.Positive, age: S.Number })
		const struct = implemented.make()
		assertEquals(struct, { name: "", score: 0, age: 0 })
		implemented.validate(struct)
		assertThrows(() => implemented.validate({ name: "Luke", score: -29, age: 10 }))
		assertThrows(() => implemented.validate({ name: "Luke", score: 29 }))
	})

	it("does arrays of", () => {
		const schema = S.ArrayOf(S.Number)
		const array = schema.make()
		assertEquals(array, [])
		schema.validate(array)
		schema.validate([0, 1, 2])
		assertThrows(() => schema.validate([0, "1", 2]))
	})

	it("does enums", () => {
		const schema = S.Enum(["red", "green", "blue"])
		const value = schema.make()
		assertEquals(value, "red")
		schema.validate(value)
		schema.validate("green")
		schema.validate("blue")
		assertThrows(() => schema.validate("yellow"))
	})

	it("does finite numbers", () => {
		const schema = S.Finite
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		schema.validate(-1)
		assertThrows(() => schema.validate(Infinity))
		assertThrows(() => schema.validate(NaN))
	})

	it("does integers", () => {
		const schema = S.Integer
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		schema.validate(-1)
		assertThrows(() => schema.validate(1.1))
	})

	it("does safe integers", () => {
		const schema = S.SafeInteger
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		schema.validate(-1)
		assertThrows(() => schema.validate(1.1))
		assertThrows(() => schema.validate(2 ** 53))
	})

	it("does positive numbers", () => {
		const schema = S.Positive
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(-1))
	})

	it("does negative numbers", () => {
		const schema = S.Negative
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(-1)
		assertThrows(() => schema.validate(1))
	})

	it("does positive integers", () => {
		const schema = S.PositiveInteger
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(-1))
		assertThrows(() => schema.validate(1.1))
	})

	it("does safe positive integers", () => {
		const schema = S.SafePositiveInteger
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(-1))
		assertThrows(() => schema.validate(1.1))
		assertThrows(() => schema.validate(2 ** 53))
	})

	it("does 2D vectors", () => {
		const schema = S.Vector2D
		const value = schema.make()
		assertEquals(value, [0, 0])
		schema.validate(value)
		schema.validate([1, 1])
		assertThrows(() => schema.validate([1, 1, 1]))
		assertThrows(() => schema.validate([1, "1"]))
	})

	it("does 3D vectors", () => {
		const schema = S.Vector3D
		const value = schema.make()
		assertEquals(value, [0, 0, 0])
		schema.validate(value)
		schema.validate([1, 1, 1])
		assertThrows(() => schema.validate([1, 1, 1, 1]))
		assertThrows(() => schema.validate([1, "1", 1]))
	})

	it("does truthy values", () => {
		const schema = S.Truthy
		const value = schema.make()
		assertEquals(value, true)
		schema.validate(value)
		schema.validate(1)
		schema.validate("1")
		schema.validate({})
		schema.validate([])
		assertThrows(() => schema.validate(false))
		assertThrows(() => schema.validate(0))
		assertThrows(() => schema.validate(""))
		assertThrows(() => schema.validate(null))
		assertThrows(() => schema.validate(undefined))
	})

	it("does falsy values", () => {
		const schema = S.Falsy
		const value = schema.make()
		assertEquals(value, false)
		schema.validate(value)
		schema.validate(0)
		schema.validate("")
		schema.validate(null)
		schema.validate(undefined)
		assertThrows(() => schema.validate(true))
		assertThrows(() => schema.validate(1))
		assertThrows(() => schema.validate("1"))
		assertThrows(() => schema.validate({}))
		assertThrows(() => schema.validate([]))
	})

	it("does specific values", () => {
		const schema = S.Value(1)
		const value = schema.make()
		assertEquals(value, 1)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(2))
	})

	it("does trues", () => {
		const schema = S.True
		const value = schema.make()
		assertEquals(value, true)
		schema.validate(value)
		schema.validate(true)
		assertThrows(() => schema.validate(false))
		assertThrows(() => schema.validate(1))
	})

	it("does falses", () => {
		const schema = S.False
		const value = schema.make()
		assertEquals(value, false)
		schema.validate(value)
		schema.validate(false)
		assertThrows(() => schema.validate(true))
		assertThrows(() => schema.validate(0))
	})

	it("does undefineds", () => {
		const schema = S.Undefined
		const value = schema.make()
		assertEquals(value, undefined)
		schema.validate(value)
		schema.validate(undefined)
		assertThrows(() => schema.validate(null))
		assertThrows(() => schema.validate(0))
	})

	it("does typed objects", () => {
		const schema = S.ObjectWith({
			keysOf: S.Integer,
			valuesOf: S.String,
		})
		const value = schema.make()
		assertEquals(value, {})
		schema.validate(value)
		schema.validate({ 1: "Lu" })
		assertThrows(() => schema.validate({ 1: 1 }))
		assertThrows(() => schema.validate({ score: "Lu" }))
	})

	it("does stringified values", () => {
		const schema = S.Stringified(S.Integer)
		const value = schema.make()
		assertEquals(value, "0")
		schema.validate(value)
		schema.validate("1")
		schema.validate(1)
	})
})

describe("schema operations", () => {
	it("does or", () => {
		const schema = S.Integer.or(S.String)
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		schema.validate("1")
		assertThrows(() => schema.validate(false))
	})

	it("does and", () => {
		const schema = S.Integer.and(S.Positive)
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(-1))
		assertThrows(() => schema.validate(1.5))
	})

	it("does not", () => {
		const schema = S.Integer.not()
		assertThrows(() => schema.make())
		schema.validate(1.5)
		assertThrows(() => schema.validate(1))
	})

	it("does and not", () => {
		const schema = S.Integer.and(S.Positive.not())
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(-1)
		assertThrows(() => schema.validate(1))
	})

	it("does with a different make", () => {
		const schema = S.Integer.withMake(() => 1)
		const value = schema.make()
		assertEquals(value, 1)
		schema.validate(value)
		schema.validate(0)
	})

	it("does with a different check", () => {
		const schema = S.Positive.withCheck((v) => v > 0)
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(1)
		assertThrows(() => schema.validate(0))
	})

	it("does with an additional check", () => {
		const schema = S.Integer.andCheck((v) => v % 2 === 0)
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(2)
		assertThrows(() => schema.validate(1))
	})

	it("does with a different default value", () => {
		const schema = S.Integer.withDefault(1)
		const value = schema.make()
		assertEquals(value, 1)
		schema.validate(value)
		schema.validate(0)
	})

	it("gets a reference", () => {
		const reference = S.reference("String")
		reference.validate("Lu")
		assertThrows(() => reference.validate(1))
	})
})
