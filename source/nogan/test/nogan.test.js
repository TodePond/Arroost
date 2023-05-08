import { assertEquals } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import { createId, freeId } from "../source/nogan.js"
import { advance, createNod, createPhantom, createWire, pulse } from "../source/sugar.js"

describe("id", () => {
	it("gets a new id", () => {
		const phantom = createPhantom()
		const id0 = createId(phantom)
		assertEquals(id0, 0)
		const id1 = createId(phantom)
		assertEquals(id1, 1)
	})

	it("reuses ids", () => {
		const phantom = createPhantom()
		const id0 = createId(phantom)
		assertEquals(id0, 0)
		freeId(phantom, id0)
		const id1 = createId(phantom)
		assertEquals(id1, 0)
		const id2 = createId(phantom)
		assertEquals(id2, 1)
		freeId(phantom, id1)
		const id3 = createId(phantom)
		assertEquals(id3, 0)
	})
})

//=======================//
// SUGAR below this line //
//=======================//

describe("phantom", () => {
	it("creates a phantom", () => {
		createPhantom()
	})
})

describe("nod", () => {
	it("creates a nod", () => {
		const phantom = createPhantom()
		createNod(phantom)
	})
})

describe("wire", () => {
	it("creates a wire", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		createWire(phantom, { source: nod.id, target: nod.id })
	})
})

describe("tick", () => {
	it("nod ticks", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		pulse(phantom, { target: nod.id })
		assertEquals(nod.pulse.any.all, true)
		const advanced = advance(nod)
		assertEquals(advanced.pulse.any.all, false)
	})

	it("phantom ticks children", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		pulse(phantom, { target: nod.id })
		assertEquals(phantom.children[nod.id].pulse.any.all, true)
		const advanced = advance(phantom)
		assertEquals(advanced.children[nod.id].pulse.any.all, false)
	})
})

describe("pulse", () => {
	it("fires a pulse event", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		let fired = false
		const onPulse = () => {
			fired = true
		}
		addEventListener("pulse", onPulse)
		pulse(phantom, { target: nod.id })
		assertEquals(fired, true)
		removeEventListener("pulse", onPulse)
	})
})
