import { assert, assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import {
	addChild,
	addPulse,
	createId,
	createNod,
	createPhantom,
	createWire,
	deleteChild,
	destroyNod,
	destroyWire,
	freeId,
	getPeak,
	modifyNod,
	modifyWire,
	project,
	reconnectWire,
	replaceNod,
} from "../source/nogan.js"
import { NoganSchema } from "../source/schema.js"

const N = NoganSchema

describe("family", () => {
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

	it("adds a child", () => {
		const phantom = N.Phantom.make()
		const nod = N.Nod.make()
		addChild(phantom, nod)
	})

	it("deletes a child", () => {
		const phantom = N.Phantom.make()
		const nod = N.Nod.make()
		addChild(phantom, nod)
		deleteChild(phantom, nod.id)
	})
})

describe("creating", () => {
	it("creates a phantom", () => {
		createPhantom()
	})

	it("creates a nod", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
	})
	it("creates a wire", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const wire = createWire(phantom, { source: nod.id, target: nod.id })
		assertEquals(nod.outputs, [wire.id])
		assertEquals(nod.inputs, [wire.id])
		assertEquals(wire.source, nod.id)
		assertEquals(wire.target, nod.id)
	})
})

describe("destroying", () => {
	it("destroys a wire", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const wire = createWire(phantom, { source: nod.id, target: nod.id })

		assertEquals(nod.outputs, [wire.id])
		assertEquals(nod.inputs, [wire.id])

		destroyWire(phantom, wire.id)

		assertEquals(nod.outputs, [])
		assertEquals(nod.inputs, [])
	})

	it("destroys a nod", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)

		destroyNod(phantom, nod.id)
	})

	it("can't destroy a nod with wires", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		createWire(phantom, { source: nod.id, target: nod.id })

		assertThrows(() => destroyNod(phantom, nod.id), "Cannot destroy nod with wires")
	})
})

describe("connecting", () => {
	it("replaces a nod", () => {
		const phantom = createPhantom()
		const original = createNod(phantom)
		const replacement = createNod(phantom)
		const wire = createWire(phantom, { source: original.id, target: original.id })

		assertEquals(wire.source, original.id)
		assertEquals(wire.target, original.id)

		assertEquals(original.outputs, [wire.id])
		assertEquals(original.inputs, [wire.id])
		assertEquals(replacement.outputs, [])
		assertEquals(replacement.inputs, [])

		replaceNod(phantom, { original: original.id, replacement: replacement.id })

		assertEquals(wire.source, replacement.id)
		assertEquals(wire.target, replacement.id)

		assertEquals(original.outputs, [])
		assertEquals(original.inputs, [])
		assertEquals(replacement.outputs, [wire.id])
		assertEquals(replacement.inputs, [wire.id])
	})

	it("reconnects a wire target", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		const wire = createWire(phantom, { source: nod1.id, target: nod1.id })

		assertEquals(wire.source, nod1.id)
		assertEquals(wire.target, nod1.id)

		assertEquals(nod1.outputs, [wire.id])
		assertEquals(nod1.inputs, [wire.id])
		assertEquals(nod2.outputs, [])
		assertEquals(nod2.inputs, [])

		reconnectWire(phantom, { id: wire.id, target: nod2.id })

		assertEquals(wire.source, nod1.id)
		assertEquals(wire.target, nod2.id)

		assertEquals(nod1.outputs, [wire.id])
		assertEquals(nod1.inputs, [])
		assertEquals(nod2.outputs, [])
		assertEquals(nod2.inputs, [wire.id])
	})

	it("reconnects a wire source", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		const wire = createWire(phantom, { source: nod1.id, target: nod1.id })

		assertEquals(wire.source, nod1.id)
		assertEquals(wire.target, nod1.id)

		assertEquals(nod1.outputs, [wire.id])
		assertEquals(nod1.inputs, [wire.id])
		assertEquals(nod2.outputs, [])
		assertEquals(nod2.inputs, [])

		reconnectWire(phantom, { id: wire.id, source: nod2.id })

		assertEquals(wire.source, nod2.id)
		assertEquals(wire.target, nod1.id)

		assertEquals(nod1.outputs, [])
		assertEquals(nod1.inputs, [wire.id])
		assertEquals(nod2.outputs, [wire.id])
		assertEquals(nod2.inputs, [])
	})

	it("reconnects a wire source and target", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		const wire = createWire(phantom, { source: nod1.id, target: nod1.id })

		assertEquals(wire.source, nod1.id)
		assertEquals(wire.target, nod1.id)

		assertEquals(nod1.outputs, [wire.id])
		assertEquals(nod1.inputs, [wire.id])
		assertEquals(nod2.outputs, [])
		assertEquals(nod2.inputs, [])

		reconnectWire(phantom, { id: wire.id, source: nod2.id, target: nod2.id })

		assertEquals(wire.source, nod2.id)
		assertEquals(wire.target, nod2.id)

		assertEquals(nod1.outputs, [])
		assertEquals(nod1.inputs, [])
		assertEquals(nod2.outputs, [wire.id])
		assertEquals(nod2.inputs, [wire.id])
	})
})

describe("pulsing", () => {
	it("pulses a nod", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)

		assert(!nod.pulses.blue)
		addPulse(phantom, { target: nod.id })
		assert(nod.pulses.blue)
	})

	it("adds a specific pulse", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)

		assertEquals(nod.pulses.blue, null)
		addPulse(phantom, { target: nod.id, type: "creation" })
		assertEquals(nod.pulses.blue, { type: "creation" })
	})
})

describe("modifying", () => {
	it("modifies a nod", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)

		assertEquals(nod.position, [0, 0])
		assertEquals(nod.type, "any")
		modifyNod(phantom, { id: nod.id, position: [10, 20], type: "creation" })
		assertEquals(nod.position, [10, 20])
		assertEquals(nod.type, "creation")
	})

	it("modifies a wire", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const wire = createWire(phantom, { source: nod.id, target: nod.id })

		assertEquals(wire.timing, 0)
		assertEquals(wire.colour, "blue")
		modifyWire(phantom, { id: wire.id, timing: 1, colour: "red" })
		assertEquals(wire.timing, 1)
		assertEquals(wire.colour, "red")
	})

	it("sticks with current values", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const wire = createWire(phantom, { source: nod.id, target: nod.id })

		assertEquals(wire.timing, 0)
		assertEquals(wire.colour, "blue")
		modifyWire(phantom, { id: wire.id })
		assertEquals(wire.timing, 0)
		assertEquals(wire.colour, "blue")

		assertEquals(nod.position, [0, 0])
		assertEquals(nod.type, "any")
		modifyNod(phantom, { id: nod.id })
		assertEquals(nod.position, [0, 0])
		assertEquals(nod.type, "any")
	})
})

describe("projecting", () => {
	it("clones a nod", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const projection = project(nod)
		assertEquals(projection, nod)
	})

	it("removes pulses", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		assertEquals(nod.pulses.blue, null)
		addPulse(phantom, { target: nod.id })
		assert(nod.pulses.blue)
		const projection = project(phantom)
		assert(nod.pulses.blue)

		const projectedNod = projection.children[nod.id]
		assertEquals(projectedNod.pulses.blue, null)
	})
})

describe("peaking", () => {
	it("finds a pulse in the present", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const peak1 = getPeak(phantom, { id: nod.id })
		assertEquals(peak1.result, false)
		addPulse(phantom, { target: nod.id })
		const peak2 = getPeak(phantom, { id: nod.id })
		assertEquals(peak2.result, true)
	})

	it("finds a pulse in the past", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)

		addPulse(phantom, { target: nod.id })
		const before = structuredClone(phantom)
		const peak2 = getPeak(before, { id: nod.id })
		const peak1 = getPeak(before, {
			id: nod.id,
			timing: -1,
		})

		assertEquals(peak1.result, false)
		assertEquals(peak2.result, true)

		const after = structuredClone(phantom)
		after.children[nod.id].pulses.blue = null
		const peak4 = getPeak(after, { id: nod.id })
		const peak3 = getPeak(after, {
			id: nod.id,
			timing: -1,
			history: [before],
		})
		assertEquals(peak3.result, true)
		assertEquals(peak4.result, false)
	})

	it("finds a pulse caused by the present", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id })

		const peakBefore = getPeak(phantom, { id: nod2.id })
		assertEquals(peakBefore.result, false)

		addPulse(phantom, { target: nod1.id })

		const peakAfter = getPeak(phantom, { id: nod2.id })
		assertEquals(peakAfter.result, true)
	})

	it("finds a pulse caused by the past", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id }, { timing: 1 })

		const past = project(phantom)
		const now = project(phantom)

		addPulse(past, { target: nod1.id })

		const peak = getPeak(now, { id: nod2.id, history: [past] })
		assertEquals(peak.result, true)
	})

	it("finds a future pulse caused by the present", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id }, { timing: 1 })

		const now = project(phantom)
		const future = project(phantom)

		addPulse(now, { target: nod1.id })

		const peak = getPeak(future, { id: nod2.id, history: [now] })
		assertEquals(peak.result, true)
	})

	it("finds a pulse caused by an imagined past", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		const nod3 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id }, { timing: -1 })
		createWire(phantom, { source: nod2.id, target: nod3.id }, { timing: 1 })

		addPulse(phantom, { target: nod1.id })

		const peak = getPeak(phantom, { id: nod3.id })
		assertEquals(peak.result, true)
	})

	it("finds a pulse caused by an imagined future", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		const nod3 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id }, { timing: 1 })
		createWire(phantom, { source: nod2.id, target: nod3.id }, { timing: -1 })

		addPulse(phantom, { target: nod1.id })

		const peak = getPeak(phantom, { id: nod3.id })
		assertEquals(peak.result, true)
	})

	it("finds a pulse caused by a recursive past", () => {
		const phantom = createPhantom()
		const nod1 = createNod(phantom)
		const nod2 = createNod(phantom)
		createWire(phantom, { source: nod1.id, target: nod2.id }, { timing: 1 })
		createWire(phantom, { source: nod2.id, target: nod1.id }, { timing: 1 })

		addPulse(phantom, { target: nod1.id })

		//const peak = getPeak(phantom, { id: nod2.id })
		// TODO: check the history stack for duplicate entries!
	})
})
