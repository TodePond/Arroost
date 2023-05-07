import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import { NoganSchema } from "../nogan/source/schema.js"
import { Schema } from "./schema.js"

describe("schema types", () => {
	it("does numbers", () => {
		const number = NoganSchema.Number.make()
		assertEquals(number, 0)
		NoganSchema.Number.validate(number)
	})

	it("does strings", () => {
		const string = NoganSchema.String.make()
		assertEquals(string, "")
		NoganSchema.String.validate(string)
	})

	it("does booleans", () => {
		const boolean = NoganSchema.Boolean.make()
		assertEquals(boolean, false)
		NoganSchema.Boolean.validate(boolean)
	})

	it("does arrays", () => {
		const array = NoganSchema.Array.make()
		assertEquals(array, [])
		NoganSchema.Array.validate(array)
	})

	it("does tuples", () => {
		const schema = NoganSchema.Tuple([NoganSchema.Number, NoganSchema.String])
		const tuple = schema.make()
		assertEquals(tuple, [0, ""])
		schema.validate(tuple)
		assertThrows(() => schema.validate([0, 1]))
		assertThrows(() => schema.validate([0, "1", 2]))
	})

	it("does objects", () => {
		const object = NoganSchema.Object.make()
		assertEquals(object, {})
		NoganSchema.Object.validate(object)
	})

	it("does functions", () => {
		const func = NoganSchema.Function.make()
		assertEquals(func.toString(), "() => {}")
		NoganSchema.Function.validate(func)
	})

	it("does nulls", () => {
		const _null = NoganSchema.Null.make()
		assertEquals(_null, null)
		NoganSchema.Null.validate(_null)
	})

	it("does anys", () => {
		const any = NoganSchema.Any.make()
		assertEquals(any, undefined)
		NoganSchema.Any.validate(any)
	})

	it("does partial structs", () => {
		const schema = NoganSchema.PartialStruct({
			name: NoganSchema.String,
			age: NoganSchema.Number,
		})
		const partial = schema.make()
		assertEquals(partial, { name: "", age: 0 })
		schema.validate(partial)
		schema.validate({ name: "Luke", age: 29, score: 10 })
	})

	it("does structs", () => {
		const schema = NoganSchema.Struct({
			name: NoganSchema.String,
			age: NoganSchema.Number,
		})
		const struct = schema.make()
		assertEquals(struct, { name: "", age: 0 })
		schema.validate(struct)
		assertThrows(() => schema.validate({ name: "Luke", age: 29, score: 10 }))
	})

	it("does arrays of", () => {
		const schema = NoganSchema.ArrayOf(NoganSchema.Number)
		const array = schema.make()
		assertEquals(array, [])
		schema.validate(array)
		schema.validate([0, 1, 2])
		assertThrows(() => schema.validate([0, "1", 2]))
	})

	it("does enums", () => {
		const schema = NoganSchema.Enum(["red", "green", "blue"])
		const value = schema.make()
		assertEquals(value, "red")
		schema.validate(value)
		schema.validate("green")
		schema.validate("blue")
		assertThrows(() => schema.validate("yellow"))
	})

	it("does finite numbers", () => {
		const schema = NoganSchema.Finite
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		schema.validate(-1)
		assertThrows(() => schema.validate(Infinity))
		assertThrows(() => schema.validate(NaN))
	})

	it("does integers", () => {
		const schema = NoganSchema.Integer
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		schema.validate(-1)
		assertThrows(() => schema.validate(1.1))
	})

	it("does safe integers", () => {
		const schema = NoganSchema.SafeInteger
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		schema.validate(-1)
		assertThrows(() => schema.validate(1.1))
		assertThrows(() => schema.validate(2 ** 53))
	})

	it("does positive numbers", () => {
		const schema = NoganSchema.Positive
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(-1))
	})

	it("does negative numbers", () => {
		const schema = NoganSchema.Negative
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(-1)
		assertThrows(() => schema.validate(1))
	})

	it("does positive integers", () => {
		const schema = NoganSchema.PositiveInteger
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(-1))
		assertThrows(() => schema.validate(1.1))
	})

	it("does safe positive integers", () => {
		const schema = NoganSchema.SafePositiveInteger
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(-1))
		assertThrows(() => schema.validate(1.1))
		assertThrows(() => schema.validate(2 ** 53))
	})

	it("does 2D vectors", () => {
		const schema = NoganSchema.Vector2D
		const value = schema.make()
		assertEquals(value, [0, 0])
		schema.validate(value)
		schema.validate([1, 1])
		assertThrows(() => schema.validate([1, 1, 1]))
		assertThrows(() => schema.validate([1, "1"]))
	})

	it("does 3D vectors", () => {
		const schema = NoganSchema.Vector3D
		const value = schema.make()
		assertEquals(value, [0, 0, 0])
		schema.validate(value)
		schema.validate([1, 1, 1])
		assertThrows(() => schema.validate([1, 1, 1, 1]))
		assertThrows(() => schema.validate([1, "1", 1]))
	})

	it("does truthy values", () => {
		const schema = NoganSchema.Truthy
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
		const schema = NoganSchema.Falsy
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
		const schema = NoganSchema.Value(1)
		const value = schema.make()
		assertEquals(value, 1)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(2))
	})

	it("does trues", () => {
		const schema = NoganSchema.True
		const value = schema.make()
		assertEquals(value, true)
		schema.validate(value)
		schema.validate(true)
		assertThrows(() => schema.validate(false))
		assertThrows(() => schema.validate(1))
	})

	it("does falses", () => {
		const schema = NoganSchema.False
		const value = schema.make()
		assertEquals(value, false)
		schema.validate(value)
		schema.validate(false)
		assertThrows(() => schema.validate(true))
		assertThrows(() => schema.validate(0))
	})

	it("does undefineds", () => {
		const schema = NoganSchema.Undefined
		const value = schema.make()
		assertEquals(value, undefined)
		schema.validate(value)
		schema.validate(undefined)
		assertThrows(() => schema.validate(null))
		assertThrows(() => schema.validate(0))
	})

	it("does typed objects", () => {
		const schema = NoganSchema.ObjectWith({
			keysOf: NoganSchema.Integer,
			valuesOf: NoganSchema.String,
		})
		const value = schema.make()
		assertEquals(value, {})
		schema.validate(value)
		schema.validate({ 1: "Lu" })
		assertThrows(() => schema.validate({ 1: 1 }))
		assertThrows(() => schema.validate({ score: "Lu" }))
	})

	it("does stringified values", () => {
		const schema = NoganSchema.Stringified(NoganSchema.Integer)
		const value = schema.make()
		assertEquals(value, "0")
		schema.validate(value)
		schema.validate("1")
		schema.validate(1)
	})
})

describe("schema operations", () => {
	it("does or", () => {
		const schema = NoganSchema.Integer.or(NoganSchema.String)
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		schema.validate("1")
		assertThrows(() => schema.validate(false))
	})

	it("does and", () => {
		const schema = NoganSchema.Integer.and(NoganSchema.Positive)
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(value)
		schema.validate(1)
		assertThrows(() => schema.validate(-1))
		assertThrows(() => schema.validate(1.5))
	})

	it("does not", () => {
		const schema = NoganSchema.Integer.not()
		assertThrows(() => schema.make())
		schema.validate(1.5)
		assertThrows(() => schema.validate(1))
	})

	it("does and not", () => {
		const schema = NoganSchema.Integer.and(NoganSchema.Positive.not())
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(-1)
		assertThrows(() => schema.validate(1))
	})

	it("does with a different make", () => {
		const schema = NoganSchema.Integer.withMake(() => 1)
		const value = schema.make()
		assertEquals(value, 1)
		schema.validate(value)
		schema.validate(0)
	})

	it("does with a different check", () => {
		const schema = NoganSchema.Positive.withCheck((v) => v > 0)
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(1)
		assertThrows(() => schema.validate(0))
	})

	it("does with an additional check", () => {
		const schema = NoganSchema.Integer.andCheck((v) => v % 2 === 0)
		const value = schema.make()
		assertEquals(value, 0)
		schema.validate(2)
		assertThrows(() => schema.validate(1))
	})

	it("does with a different default value", () => {
		const schema = NoganSchema.Integer.withDefault(1)
		const value = schema.make()
		assertEquals(value, 1)
		schema.validate(value)
		schema.validate(0)
	})

	it("gets a reference", () => {
		const reference = Schema.reference("String")
		reference.validate("Lu")
		assertThrows(() => reference.validate(1))
	})
})
