import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts"
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
	modifyNod,
	modifyWire,
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

		assertEquals(nod.pulse.any.blue, false)
		addPulse(phantom, { target: nod.id })
		assertEquals(nod.pulse.any.blue, true)
	})

	it("transforms a pulse", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		nod.type = "creation"

		assertEquals(nod.pulse.any.blue, false)
		assertEquals(nod.pulse.creation.blue, false)
		addPulse(phantom, { target: nod.id })
		assertEquals(nod.pulse.any.blue, false)
		assertEquals(nod.pulse.creation.blue, true)
	})

	it("adds a specific pulse", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)

		assertEquals(nod.pulse.any.blue, false)
		assertEquals(nod.pulse.creation.blue, false)
		addPulse(phantom, { target: nod.id, type: "creation" })
		assertEquals(nod.pulse.any.blue, false)
		assertEquals(nod.pulse.creation.blue, true)
	})

	it("doesn't transform a specific pulse", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		nod.type = "destruction"

		assertEquals(nod.pulse.any.blue, false)
		assertEquals(nod.pulse.creation.blue, false)
		assertEquals(nod.pulse.destruction.blue, false)
		addPulse(phantom, { target: nod.id, type: "creation" })
		assertEquals(nod.pulse.any.blue, false)
		assertEquals(nod.pulse.creation.blue, true)
		assertEquals(nod.pulse.destruction.blue, false)
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

		assertEquals(wire.timing, "now")
		assertEquals(wire.colour, "blue")
		modifyWire(phantom, { id: wire.id, timing: "after", colour: "red" })
		assertEquals(wire.timing, "after")
		assertEquals(wire.colour, "red")
	})

	it("sticks with current values", () => {
		const phantom = createPhantom()
		const nod = createNod(phantom)
		const wire = createWire(phantom, { source: nod.id, target: nod.id })

		assertEquals(wire.timing, "now")
		assertEquals(wire.colour, "blue")
		modifyWire(phantom, { id: wire.id })
		assertEquals(wire.timing, "now")
		assertEquals(wire.colour, "blue")

		assertEquals(nod.position, [0, 0])
		assertEquals(nod.type, "any")
		modifyNod(phantom, { id: nod.id })
		assertEquals(nod.position, [0, 0])
		assertEquals(nod.type, "any")
	})
})
