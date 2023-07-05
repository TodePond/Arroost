import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import {
	addPulse,
	createNod,
	createPhantom,
	createTemplate,
	createWire,
	getPeak,
} from "./nogan.js"

describe("any behave", () => {
	it("just passes through", () => {
		const phantom = createPhantom()
		const source = createNod(phantom, { position: [1, 0] })
		const target = createNod(phantom, { position: [2, 0] })
		createWire(phantom, { source: source.id, target: target.id })
		addPulse(phantom, { target: source.id })
		const peak = getPeak(phantom, { id: target.id })
		assertEquals(peak.result, true)
		assertEquals(peak.type, "any")
		assertEquals(peak.template, createTemplate(source))
	})

	it("passes through multiple nods", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom, { position: [1, 0] })
		const nod2 = createNod(phantom, { position: [2, 0] })
		const nod3 = createNod(phantom, { position: [3, 0] })
		createWire(phantom, { source: nod1.id, target: nod2.id })
		createWire(phantom, { source: nod2.id, target: nod3.id })
		addPulse(phantom, { target: nod1.id })
		const peak2 = getPeak(phantom, { id: nod2.id })
		const peak3 = getPeak(phantom, { id: nod3.id })
		assertEquals(peak2.result, true)
		assertEquals(peak2.type, "any")
		assertEquals(peak2.template, createTemplate(nod1))
		assertEquals(peak3.result, true)
		assertEquals(peak3.type, "any")
		assertEquals(peak3.template, createTemplate(nod1))
	})
})

describe("creation behave", () => {
	it("passes on if cannot create at nod", () => {
		const phantom = createPhantom()
		const source = createNod(phantom, { type: "creation" })
		const target = createNod(phantom)
		createWire(phantom, { source: source.id, target: target.id })
		addPulse(phantom, { target: source.id })
		const peak = getPeak(phantom, { id: target.id })
		assertEquals(peak.result, true)
		assertEquals(peak.type, "creation")
		assertEquals(peak.template, createTemplate(source))
	})

	it("decides to create a recording at a slot", () => {
		const phantom = createPhantom()
		const creation = createNod(phantom, { type: "creation" })
		const slot = createNod(phantom, { type: "slot" })
		createWire(phantom, { source: creation.id, target: slot.id })
		addPulse(phantom, { target: creation.id })
		const peak = getPeak(phantom, { id: slot.id })
		// assertEquals(peak.result, true)
		assertEquals(peak.type, "creation")
		assertEquals(peak.template, createTemplate(creation))
	})
})
