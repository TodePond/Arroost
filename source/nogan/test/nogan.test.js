import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import { createId, freeId } from "../source/nogan.js"
import { NoganSchema } from "../source/schema.js"

describe("schema", () => {
	it("validates a parent", () => {
		const nogan = NoganSchema.Parent.make()
		NoganSchema.Parent.validate(nogan)
	})
})

describe("id", () => {
	it("gets a new id", () => {
		const nogan = NoganSchema.Parent.make()
		const id0 = createId(nogan)
		assertEquals(id0, 0)
		const id1 = createId(nogan)
		assertEquals(id1, 1)
	})

	it("reuses ids", () => {
		const nogan = NoganSchema.Parent.make()
		const id0 = createId(nogan)
		assertEquals(id0, 0)
		freeId(nogan, id0)
		const id1 = createId(nogan)
		assertEquals(id1, 0)
		const id2 = createId(nogan)
		assertEquals(id2, 1)
		freeId(nogan, id1)
		const id3 = createId(nogan)
		assertEquals(id3, 0)
	})
})
