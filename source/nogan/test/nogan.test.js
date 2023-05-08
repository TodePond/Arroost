import { assertEquals, assertNotEquals } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import {
	advance,
	createId,
	createNod,
	createPhantom,
	createWire,
	fire,
	freeId,
	project,
} from "../source/nogan.js"

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
	it("ends pulses", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		fire(phantom, { target: nod.id })
		assertEquals(nod.pulse.any.all, true)
		advance(phantom)
		assertEquals(nod.pulse.any.all, false)
	})

	it("ticks children", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		fire(phantom, { target: nod.id })
		assertEquals(nod.pulse.any.all, true)
		advance(phantom)
		assertEquals(nod.pulse.any.all, false)
	})

	it("ticks children recursively", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const nodNod = createNod(nod)
		fire(phantom, { target: nod.id })
		fire(nod, { target: nodNod.id })

		assertEquals(nod.pulse.any.all, true)
		assertEquals(nodNod.pulse.any.all, true)
		advance(phantom)
		assertEquals(nod.pulse.any.all, false)
		assertEquals(nodNod.pulse.any.all, false)
	})
})

describe("project", () => {
	it("clones", () => {
		const phantom = createPhantom()
		const projected = project(phantom)
		assertEquals(projected, phantom)
		createNod(phantom)
		assertNotEquals(projected, phantom)
	})

	it("applies operations", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const projected = project(phantom, (v) => fire(v, { target: nod.id }))
		assertEquals(phantom.children[nod.id].pulse.any.all, false)
		assertEquals(projected.children[nod.id].pulse.any.all, true)
	})
})

describe("pulse", () => {
	it("fires", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		assertEquals(nod.pulse.any.all, false)
		fire(phantom, { target: nod.id })
		assertEquals(nod.pulse.any.all, true)
	})

	it("fires connections", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id })

		assertEquals(nod1.pulse.any.all, false)
		assertEquals(nod2.pulse.any.all, false)
		fire(phantom, { target: nod1.id })
		assertEquals(nod1.pulse.any.all, true)
		assertEquals(nod2.pulse.any.all, true)
	})

	it("fires connections recursively", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		const nod3 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id })
		createWire(phantom, { source: nod2.id, target: nod3.id })

		assertEquals(nod1.pulse.any.all, false)
		assertEquals(nod2.pulse.any.all, false)
		assertEquals(nod3.pulse.any.all, false)
		fire(phantom, { target: nod1.id })
		assertEquals(nod1.pulse.any.all, true)
		assertEquals(nod2.pulse.any.all, true)
		assertEquals(nod3.pulse.any.all, true)
	})

	it("fires looping connections", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id })
		createWire(phantom, { source: nod2.id, target: nod1.id })

		assertEquals(nod1.pulse.any.all, false)
		assertEquals(nod2.pulse.any.all, false)
		fire(phantom, { target: nod1.id })
		assertEquals(nod1.pulse.any.all, true)
		assertEquals(nod2.pulse.any.all, true)
	})
})
