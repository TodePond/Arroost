import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts"
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import { addChild, createChild, createId, freeId, getTicked, pulse } from "../source/nogan.js"
import { NoganSchema } from "../source/schema.js"

describe("schema", () => {
	it("validates a parent", () => {
		const parent = NoganSchema.Parent.make()
		NoganSchema.Parent.validate(parent)
	})

	it("validates a child", () => {
		const child = NoganSchema.Child.make()
		assertThrows(() => NoganSchema.Child.validate(child))
		child.id = 0
		NoganSchema.Child.validate(child)
	})

	it("validates a phantom", () => {
		const phantom = NoganSchema.Phantom.make()
		NoganSchema.Phantom.validate(phantom)
	})

	it("validates a wire", () => {
		const wire = NoganSchema.Wire.make()
		assertThrows(() => NoganSchema.Wire.validate(wire))
		wire.id = 0
		NoganSchema.Wire.validate(wire)
	})

	it("validates a nod", () => {
		const nod = NoganSchema.Nod.make()
		assertThrows(() => NoganSchema.Nod.validate(nod))
		nod.id = 0
		NoganSchema.Nod.validate(nod)
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

describe("family", () => {
	it("adds a child", () => {
		const parent = NoganSchema.Parent.make()
		const child = createChild(NoganSchema.Child, parent)
		assertEquals(parent.children[child.id], child)
	})
})

describe("tick", () => {
	it("ticks pulse", () => {
		const parent = NoganSchema.Parent.make()
		assertEquals(parent.pulse.any.blue, false)
		parent.pulse.any.blue = true
		assertEquals(parent.pulse.any.blue, true)
		const ticked = getTicked(parent)
		assertEquals(ticked.pulse.any.blue, false)
	})

	it("ticks children", () => {
		const parent = NoganSchema.Parent.make()
		parent.pulse.any.blue = true
		const child = createChild(NoganSchema.Child, parent)
		child.pulse.any.blue = true
		const ticked = getTicked(parent)
		const tickedChild = ticked.children[child.id]
		assertEquals(tickedChild.pulse.any.blue, false)
	})
})

describe("pulse", () => {
	it("fires a pulse event", () => {
		const phantom = NoganSchema.Phantom.make()
		const nod = NoganSchema.Nod.make()
		addChild(phantom, nod)
		let clock = 0
		const onPulse = (event) => {
			clock++
			const { detail } = event
			assertEquals(detail.type, "any")
			assertEquals(detail.colour, "all")
			assertEquals(detail.target, nod)
			assertEquals(detail.parent, phantom)
		}
		addEventListener("pulse", onPulse)
		pulse({ parent: phantom, target: nod })
		assertEquals(clock, 1)
		removeEventListener("pulse", onPulse)
	})
})
