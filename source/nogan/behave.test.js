import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import { createNod, createPhantom, createWire } from "./nogan.js"

describe("any behave", () => {
	it("just passes through", () => {
		const phantom = createPhantom()
		const any1 = createNod(phantom, { position: [1, 0] })
		const any2 = createNod(phantom, { position: [2, 0] })
		createWire(phantom, { source: any1.id, target: any2.id })
		// addPulse(phantom, { target: any1.id })
		// const peak = getPeak(phantom, { id: any2.id })
		// assertEquals(peak.result, true)
		// assertEquals(peak.type, "any")
		// assertEquals(peak.template, createTemplate(any1))
	})
})
