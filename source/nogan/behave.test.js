import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import { createNod, createPhantom, getPeak } from "./nogan.js"

describe("peak", () => {
	it("gets info for unfiring nod", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom, { position: [1, 0] })
		const peak = getPeak(phantom, { id: nod.id })
		assertEquals(peak, {
			schemaName: "Peak",
			result: false,
			type: "any",
			data: undefined,
			operations: [],
		})
	})

	// it("gets info for firing nod", () => {
	// 	const phantom = createPhantom()
	// 	const nod = createNod(phantom, { position: [1, 0] })
	// 	addPulse(phantom, { id: nod.id, type: "any" })
	// 	const peak = getPeak(phantom, { id: nod.id })
	// 	assertEquals(peak, {
	// 		schemaName: "Peak",
	// 		result: true,
	// 		type: "any",
	// 		data: undefined,
	// 		operations: [],
	// 	})
	// })
})
