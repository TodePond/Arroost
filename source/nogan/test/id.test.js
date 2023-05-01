import { assert } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import { Nogan } from "../nogan.js"

describe("id", () => {
	it("gets a new id", () => {
		const nogan = new Nogan()
		const id = nogan.createId()
		assert(id === 0)

		const id2 = nogan.createId()
		assert(id2 === 1)
	})

	it("reuses ids", () => {
		const nogan = new Nogan()
		const id = nogan.createId()
		assert(id === 0)
		nogan.freeId(id)

		const id2 = nogan.createId()
		assert(id2 === 0)

		const id3 = nogan.createId()
		assert(id3 === 1)
	})
})
