// @ts-expect-error
import { assert, assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts"
// @ts-expect-error
import { describe, it } from "https://deno.land/std/testing/bdd.ts"
import {
	archiveCell,
	archiveCellId,
	archiveWireId,
	createCell,
	createFire,
	createNogan,
	createPeak,
	createPulse,
	createTemplate,
	createWire,
	deleteArchivedCellId,
	deleteArchivedCellIds,
	deleteArchivedWireId,
	deleteArchivedWireIds,
	deleteCell,
	deleteCellId,
	deleteWire,
	deleteWireId,
	fireCell,
	getCell,
	getCells,
	getPeak,
	getProjectedNogan,
	getRoot,
	getWire,
	getWires,
	giveChild,
	iterateCells,
	iterateWires,
	modifyCell,
	modifyWire,
	reserveCellId,
	reserveWireId,
} from "./nogan.js"
import { NoganSchema } from "./schema.js"

const N = NoganSchema

describe("nogan", () => {
	it("creates a nogan", () => {
		const nogan = createNogan()
		assertEquals(Object.values(nogan.items).length, 1)
	})

	it("gets its root", () => {
		const nogan = createNogan()
		const root = getRoot(nogan)
		assertEquals(root.type, "root")
	})
})

describe("id", () => {
	it("reserves a cell id", () => {
		const nogan = createNogan()
		const id1 = reserveCellId(nogan)
		assertEquals(id1, 1)
		assertThrows(() => reserveCellId(nogan))
	})

	it("reserves a wire id", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		assertEquals(id1, -1)
		assertThrows(() => reserveWireId(nogan))
	})

	it("deletes a cell id", () => {
		const nogan = createNogan()
		const id1 = reserveCellId(nogan)
		assertEquals(id1, 1)
		deleteCellId(nogan, id1)
		assertEquals(nogan.deletedCells, [1])
		assertThrows(() => deleteCellId(nogan, id1))
	})

	it("deletes a wire id", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		assertEquals(id1, -1)
		deleteWireId(nogan, id1)
		assertEquals(nogan.deletedWires, [-1])
		assertThrows(() => deleteWireId(nogan, id1))
	})

	it("reuses a cell id", () => {
		const nogan = createNogan()
		const id1 = reserveCellId(nogan)
		assertEquals(id1, 1)
		deleteCellId(nogan, id1)
		const id2 = reserveCellId(nogan)
		assertEquals(id2, 1)
		assertThrows(() => reserveCellId(nogan))
	})

	it("reuses a wire id", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		assertEquals(id1, -1)
		deleteWireId(nogan, id1)
		const id2 = reserveWireId(nogan)
		assertEquals(id2, -1)
		assertThrows(() => reserveWireId(nogan))
	})

	it("archives a cell id", () => {
		const nogan = createNogan()
		const id1 = reserveCellId(nogan)
		assertEquals(id1, 1)
		archiveCellId(nogan, id1)
		assertEquals(nogan.archivedCells, [1])
		const id2 = reserveCellId(nogan)
		assertEquals(id2, 2)
	})

	it("archives a wire id", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		assertEquals(id1, -1)
		archiveWireId(nogan, id1)
		assertEquals(nogan.archivedWires, [-1])
		const id2 = reserveWireId(nogan)
		assertEquals(id2, -2)
	})

	it("deletes an archived cell id", () => {
		const nogan = createNogan()
		const id1 = reserveCellId(nogan)
		assertEquals(id1, 1)
		archiveCellId(nogan, id1)
		assertEquals(nogan.archivedCells, [1])
		assertEquals(nogan.deletedCells, [])
		deleteArchivedCellId(nogan, id1)
		assertEquals(nogan.archivedCells, [])
		assertEquals(nogan.deletedCells, [1])
	})

	it("deletes an archived wire id", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		assertEquals(id1, -1)
		archiveWireId(nogan, id1)
		assertEquals(nogan.archivedWires, [-1])
		assertEquals(nogan.deletedWires, [])
		deleteArchivedWireId(nogan, id1)
		assertEquals(nogan.archivedWires, [])
		assertEquals(nogan.deletedWires, [-1])
	})

	it("deletes archived cell ids", () => {
		const nogan = createNogan()
		const id1 = reserveCellId(nogan)
		archiveCellId(nogan, id1)
		const id2 = reserveCellId(nogan)
		archiveCellId(nogan, id2)
		assertEquals(nogan.archivedCells, [1, 2])
		assertEquals(nogan.deletedCells, [])
		deleteArchivedCellIds(nogan)
		assertEquals(nogan.archivedCells, [])
		assertEquals(nogan.deletedCells, [1, 2])
	})

	it("deletes archived wire ids", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		archiveWireId(nogan, id1)
		const id2 = reserveWireId(nogan)
		archiveWireId(nogan, id2)
		assertEquals(nogan.archivedWires, [-1, -2])
		assertEquals(nogan.deletedWires, [])
		deleteArchivedWireIds(nogan)
		assertEquals(nogan.archivedWires, [])
		assertEquals(nogan.deletedWires, [-1, -2])
	})
})

describe("cell", () => {
	it("creates a cell", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		assertEquals(nogan.items[1], cell)
	})

	it("gets a cell", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = getCell(nogan, cell1.id)
		assertEquals(cell1, cell2)
	})

	it("iterates over cells", () => {
		const nogan = createNogan()
		const root = getRoot(nogan)
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cells = []
		for (const cell of iterateCells(nogan)) {
			cells.push(cell)
		}
		assertEquals(cells, [root, cell1, cell2])
	})

	it("gets all cells", () => {
		const nogan = createNogan()
		const root = getRoot(nogan)
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cells = getCells(nogan)
		assertEquals(cells, [root, cell1, cell2])
	})

	it("creates a child", () => {
		const nogan = createNogan()
		const parent = createCell(nogan)
		const child = createCell(nogan, { parent: parent.id })
		assertEquals(child.parent, parent.id)
		assertEquals(parent.cells, [child.id])
	})

	it("gives a child to a sibling", () => {
		const nogan = createNogan()
		const parent1 = createCell(nogan)
		const parent2 = createCell(nogan)
		const child = createCell(nogan, { parent: parent1.id })
		assertEquals(parent1.cells, [child.id])
		assertEquals(child.parent, parent1.id)
		giveChild(nogan, { child: child.id, source: parent1.id, target: parent2.id })
		assertEquals(parent1.cells, [])
		assertEquals(parent2.cells, [child.id])
		assertEquals(child.parent, parent2.id)
	})

	it("gives a child from root", () => {
		const nogan = createNogan()
		const child = createCell(nogan)
		const parent = createCell(nogan)
		const root = getRoot(nogan)
		assertEquals(child.parent, root.id)
		assertEquals(parent.cells, [])
		assertEquals(root.cells, [child.id, parent.id])
		giveChild(nogan, { child: child.id, target: parent.id })
		assertEquals(child.parent, parent.id)
		assertEquals(parent.cells, [child.id])
		assertEquals(root.cells, [parent.id])
	})

	it("creates a cell with type and position", () => {
		const nogan = createNogan()
		const cell = createCell(nogan, { type: "creation", position: [10, 20] })
		assertEquals(cell.type, "creation")
		assertEquals(cell.position, [10, 20])
	})

	it("creates a template of a cell", () => {
		const nogan = createNogan()
		const cell = createCell(nogan, { type: "creation", position: [10, 20] })
		const template = createTemplate(cell)
		assertEquals(template, { type: "creation", position: [10, 20] })
	})

	it("creates a cell from a template", () => {
		const nogan = createNogan()
		const template = createTemplate({ type: "creation", position: [10, 20] })
		const cell = createCell(nogan, template)
		assertEquals(cell.type, "creation")
		assertEquals(cell.position, [10, 20])
	})

	it("deletes a cell", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		const root = getRoot(nogan)
		assertEquals(root.cells, [cell.id])
		deleteCell(nogan, cell.id)
		assertEquals(root.cells, [])
		assertEquals(nogan.deletedCells, [cell.id])
	})

	it("archives a cell", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		const root = getRoot(nogan)
		assertEquals(root.cells, [cell.id])
		archiveCell(nogan, cell.id)
		assertEquals(root.cells, [])
		assertEquals(nogan.archivedCells, [cell.id])
	})

	it("deletes a cell with children", () => {
		const nogan = createNogan()
		const root = getRoot(nogan)
		const parent = createCell(nogan)
		const child = createCell(nogan, { parent: parent.id })
		const cells1 = getCells(nogan)
		assertEquals(cells1, [root, parent, child])
		deleteCell(nogan, parent.id)
		assertEquals(nogan.deletedCells, [parent.id, child.id])
		const cells2 = getCells(nogan)
		assertEquals(cells2, [root])
	})

	it("deletes a cell with wires", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const wire1 = createWire(nogan, { source: cell1.id, target: cell2.id })
		const wire2 = createWire(nogan, { source: cell2.id, target: cell1.id })
		const wires1 = getWires(nogan)
		assertEquals(wires1, [wire1, wire2])
		assertEquals(cell2.inputs, [wire1.id])
		assertEquals(cell2.outputs, [wire2.id])
		deleteCell(nogan, cell1.id)
		assertEquals(nogan.deletedCells, [cell1.id])
		const wires2 = getWires(nogan)
		assertEquals(wires2, [])
		assertEquals(cell2.inputs, [])
		assertEquals(cell2.outputs, [])
	})

	it("modifies a cell", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		assertEquals(cell.type, "dummy")
		assertEquals(cell.position, [0, 0])
		modifyCell(nogan, { id: cell.id, type: "creation", position: [10, 20] })
		assertEquals(cell.type, "creation")
		assertEquals(cell.position, [10, 20])
	})

	it.skip("propogates a modification", () => {})
})

describe("wire", () => {
	it("creates a wire", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		const wire = createWire(nogan, { source: source.id, target: target.id })
		assertEquals(source.outputs, [wire.id])
		assertEquals(target.inputs, [wire.id])
		assertEquals(wire.source, source.id)
		assertEquals(wire.target, target.id)
		assertEquals(nogan.items[-1], wire)
	})

	it("gets a wire", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		const wire1 = createWire(nogan, { source: source.id, target: target.id })
		const wire2 = getWire(nogan, wire1.id)
		assertEquals(wire1, wire2)
	})

	it("iterates over wires", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const wire1 = createWire(nogan, { source: cell1.id, target: cell2.id })
		const wire2 = createWire(nogan, { source: cell2.id, target: cell1.id })
		const wires = []
		for (const wire of iterateWires(nogan)) {
			wires.push(wire)
		}
		assertEquals(wires, [wire1, wire2])
	})

	it("gets all wires", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const wire1 = createWire(nogan, { source: cell1.id, target: cell2.id })
		const wire2 = createWire(nogan, { source: cell2.id, target: cell1.id })
		const wires = getWires(nogan)
		assertEquals(wires, [wire1, wire2])
	})

	it("deletes a wire", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		const wire = createWire(nogan, { source: source.id, target: target.id })
		assertEquals(source.outputs, [wire.id])
		assertEquals(target.inputs, [wire.id])
		deleteWire(nogan, wire.id)
		assertEquals(source.outputs, [])
		assertEquals(target.inputs, [])
	})

	it("modifies a wire", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		const wire = createWire(nogan, { source: source.id, target: target.id })
		assertEquals(wire.timing, 0)
		assertEquals(wire.colour, "any")
		modifyWire(nogan, { id: wire.id, timing: 1, colour: "red" })
		assertEquals(wire.timing, 1)
		assertEquals(wire.colour, "red")
	})

	it.skip("propogates a modification", () => {})
})

describe("pulse", () => {
	it("creates a pulse", () => {
		const pulse = createPulse()
		assertEquals(pulse, { type: "raw" })
	})

	it("creates a fire", () => {
		const fire = createFire()
		assertEquals(fire, { blue: null, green: null, red: null })
	})

	it("fires a cell", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		assertEquals(cell.fire.blue, null)
		fireCell(nogan, { id: cell.id })
		assertEquals(cell.fire.blue, { type: "raw" })
		assertEquals(cell.fire.green, null)
	})

	it.skip("propogates through the present", () => {})
	it.skip("propogates through the past", () => {})
	it.skip("propogates through the future", () => {})
})

describe("project", () => {
	it("clones a nogan", () => {
		const nogan = createNogan()
		const projection = getProjectedNogan(nogan)
		assertEquals(projection, nogan)
		assert(projection !== nogan)
	})

	it("ends fires", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		fireCell(nogan, { id: cell.id })
		assertEquals(cell.fire.blue, { type: "raw" })

		const projection = getProjectedNogan(nogan)
		const projectedCell = getCell(projection, cell.id)
		assertEquals(projectedCell.fire.blue, null)
	})
})

// describe("projecting", () => {

// 	it("removes pulses", () => {
// 		const phantom = createPhantom()
// 		const nod = createNod(phantom)
// 		assertEquals(nod.pulses.blue, null)
// 		addPulse(phantom, { id: nod.id })
// 		assert(nod.pulses.blue)
// 		const projection = project(phantom)
// 		assert(nod.pulses.blue)

// 		const projectedNod = getNod(projection, nod.id)
// 		assertEquals(projectedNod.pulses.blue, null)
// 	})
// })

// describe("deep projecting", () => {
// 	it("clones a nod", () => {
// 		const phantom = createPhantom()
// 		const nod = createNod(phantom)
// 		const projection = deepProject(nod)
// 		assertEquals(projection, nod)
// 	})

// 	it("removes pulses", () => {
// 		const phantom = createPhantom()
// 		const nod = createNod(phantom)
// 		assertEquals(nod.pulses.blue, null)
// 		addPulse(phantom, { id: nod.id })
// 		assert(nod.pulses.blue)
// 		const projection = deepProject(phantom)
// 		assert(nod.pulses.blue)

// 		const projectedNod = getNod(projection, nod.id)
// 		assertEquals(projectedNod.pulses.blue, null)
// 	})

// 	it("removes pulses recursively", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(nod1)
// 		const nod3 = createNod(nod2)
// 		addPulse(phantom, { id: nod1.id })
// 		addPulse(nod1, { id: nod2.id })
// 		addPulse(nod2, { id: nod3.id })

// 		assert(nod1.pulses.blue)
// 		assert(nod2.pulses.blue)
// 		assert(nod3.pulses.blue)

// 		const projection = deepProject(phantom)

// 		const projectedNod1 = getNod(projection, nod1.id)
// 		const projectedNod2 = getNod(projectedNod1, nod2.id)
// 		const projectedNod3 = getNod(projectedNod2, nod3.id)

// 		assertEquals(projectedNod1.pulses.blue, null)
// 		assertEquals(projectedNod2.pulses.blue, null)
// 		assertEquals(projectedNod3.pulses.blue, null)
// 	})

// 	it("only deep projects children that are firing", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(nod1)
// 		const nod3 = createNod(nod2)
// 		addPulse(phantom, { id: nod1.id })
// 		addPulse(nod2, { id: nod3.id })

// 		assert(nod1.pulses.blue)
// 		assertEquals(nod2.pulses.blue, null)
// 		assert(nod3.pulses.blue)

// 		const projection = deepProject(phantom)

// 		const projectedNod1 = getNod(projection, nod1.id)
// 		const projectedNod2 = getNod(projectedNod1, nod2.id)
// 		const projectedNod3 = getNod(projectedNod2, nod3.id)

// 		assertEquals(projectedNod1.pulses.blue, null)
// 		assertEquals(projectedNod2.pulses.blue, null)
// 		assert(projectedNod3.pulses.blue.type)
// 	})
// })

describe("peak", () => {
	it("creates a peak", () => {
		const peak = createPeak()
		assertEquals(peak, { result: false, operations: [] })
	})

	it("finds a real pulse in the present", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		const peak1 = getPeak(nogan, { id: cell.id })
		assertEquals(peak1.result, false)
		fireCell(nogan, { id: cell.id })
		const peak2 = getPeak(nogan, { id: cell.id })
		assertEquals(peak2.result, true)
		if (peak2.result) {
			assertEquals(peak2.pulse.type, "raw")
		}
	})

	it("finds a real pulse in the past", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		const before1 = structuredClone(nogan)
		const before2 = structuredClone(nogan)
		fireCell(before1, { id: cell.id })
		const peak1 = getPeak(nogan, { id: cell.id, timing: -1, history: [before1] })
		const peak2 = getPeak(nogan, { id: cell.id, timing: -1, history: [before2] })
		assertEquals(peak1.result, true)
		assertEquals(peak2.result, false)
	})

	it("finds a real pulse in the future", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		const after1 = structuredClone(nogan)
		const after2 = structuredClone(nogan)
		fireCell(after1, { id: cell.id })
		const peak1 = getPeak(nogan, { id: cell.id, timing: 1, future: [after1] })
		const peak2 = getPeak(nogan, { id: cell.id, timing: 1, future: [after2] })
		assertEquals(peak1.result, true)
		assertEquals(peak2.result, false)
	})

	it("finds a pulse caused by the present", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id })
		fireCell(nogan, { id: source.id, propogate: false })
		const peak = getPeak(nogan, { id: target.id })
		assertEquals(peak.result, true)
	})

	it("finds a pulse caused by the past", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id, timing: 1 })

		const before = structuredClone(nogan)
		fireCell(before, { id: source.id, propogate: false })

		const peak = getPeak(nogan, { id: target.id, history: [before] })
		assertEquals(peak.result, true)
	})

	it("finds a pulse caused by the future", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id, timing: -1 })

		const after = structuredClone(nogan)
		fireCell(after, { id: source.id, propogate: false })

		const peak = getPeak(nogan, { id: target.id, future: [after] })
		assertEquals(peak.result, true)
	})
})

describe.skip("creation pulse", () => {})
describe.skip("destruction pulse", () => {})

// 	it("finds a pulse caused by an imagined past", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: -1 })
// 		createWire(phantom, { source: nod2.id, target: nod3.id, timing: 1 })

// 		addPulse(phantom, { id: nod1.id })

// 		const peak = getPeak(phantom, { id: nod3.id })
// 		assertEquals(peak.result, true)
// 	})

// 	it("finds a pulse caused by an imagined future", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1 })
// 		createWire(phantom, { source: nod2.id, target: nod3.id, timing: -1 })

// 		addPulse(phantom, { id: nod1.id })

// 		const peak = getPeak(phantom, { id: nod3.id })
// 		assertEquals(peak.result, true)
// 	})

// 	it("peaks in a recursive past without crashing", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1 })
// 		createWire(phantom, { source: nod2.id, target: nod1.id, timing: 1 })

// 		addPulse(phantom, { id: nod1.id })

// 		const peak = getPeak(phantom, { id: nod2.id })
// 		assertEquals(peak.result, false)
// 	})

// 	it("peaks in a deep recursive past without crashing", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1 })
// 		createWire(phantom, { source: nod2.id, target: nod3.id, timing: 1 })
// 		createWire(phantom, { source: nod3.id, target: nod1.id, timing: 1 })

// 		addPulse(phantom, { id: nod1.id })

// 		const peak = getPeak(phantom, { id: nod3.id })
// 		assertEquals(peak.result, false)
// 	})

// 	it("finds a pulse in a recursive past", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1 })
// 		createWire(phantom, { source: nod2.id, target: nod1.id, timing: 1 })
// 		createWire(phantom, { source: nod3.id, target: nod1.id, timing: -1 })

// 		addPulse(phantom, { id: nod3.id })

// 		const peak3 = getPeak(phantom, { id: nod3.id })
// 		const peak2 = getPeak(phantom, { id: nod2.id })
// 		const peak1 = getPeak(phantom, { id: nod1.id })

// 		assertEquals(peak3.result, true)
// 		assertEquals(peak2.result, true)
// 		assertEquals(peak1.result, false)
// 	})

// 	it("finds a pulse in a deep recursive past", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		const nod4 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1 })
// 		createWire(phantom, { source: nod2.id, target: nod1.id, timing: 1 })
// 		createWire(phantom, { source: nod3.id, target: nod2.id, timing: -1 })
// 		createWire(phantom, { source: nod4.id, target: nod3.id, timing: -1 })

// 		addPulse(phantom, { id: nod4.id })

// 		const peak4 = getPeak(phantom, { id: nod4.id })
// 		const peak3 = getPeak(phantom, { id: nod3.id })
// 		const peak2 = getPeak(phantom, { id: nod2.id })
// 		const peak1 = getPeak(phantom, { id: nod1.id })

// 		assertEquals(peak4.result, true)
// 		assertEquals(peak3.result, false)
// 		assertEquals(peak2.result, true)
// 		assertEquals(peak1.result, false)

// 		const peak4before = getPeak(phantom, { id: nod4.id, timing: -1 })
// 		const peak3before = getPeak(phantom, { id: nod3.id, timing: -1 })
// 		const peak2before = getPeak(phantom, { id: nod2.id, timing: -1 })
// 		const peak1before = getPeak(phantom, { id: nod1.id, timing: -1 })

// 		assertEquals(peak4before.result, false)
// 		assertEquals(peak3before.result, true)
// 		assertEquals(peak2before.result, false)
// 		assertEquals(peak1before.result, true)

// 		const peak4after = getPeak(phantom, { id: nod4.id, timing: 1 })
// 		const peak3after = getPeak(phantom, { id: nod3.id, timing: 1 })
// 		const peak2after = getPeak(phantom, { id: nod2.id, timing: 1 })
// 		const peak1after = getPeak(phantom, { id: nod1.id, timing: 1 })

// 		assertEquals(peak4after.result, false)
// 		assertEquals(peak3after.result, false)
// 		assertEquals(peak2after.result, false)
// 		assertEquals(peak1after.result, true)
// 	})

// 	it("peaks in a recursive future without crashing", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: -1 })
// 		createWire(phantom, { source: nod2.id, target: nod1.id, timing: -1 })

// 		addPulse(phantom, { id: nod1.id })

// 		const peak = getPeak(phantom, { id: nod2.id })
// 		assertEquals(peak.result, false)
// 	})

// 	it("peaks in a deep recursive future without crashing", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: -1 })
// 		createWire(phantom, { source: nod2.id, target: nod3.id, timing: -1 })
// 		createWire(phantom, { source: nod3.id, target: nod1.id, timing: -1 })

// 		addPulse(phantom, { id: nod1.id })

// 		const peak = getPeak(phantom, { id: nod3.id })
// 		assertEquals(peak.result, false)
// 	})

// 	it("finds a pulse in a recursive time loop", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		const nod4 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: -1 })
// 		createWire(phantom, { source: nod2.id, target: nod3.id, timing: 1 })
// 		createWire(phantom, { source: nod3.id, target: nod1.id, timing: -1 })
// 		createWire(phantom, { source: nod4.id, target: nod3.id, timing: 1 })

// 		addPulse(phantom, { id: nod4.id })

// 		const peak4 = getPeak(phantom, { id: nod4.id })
// 		const peak3 = getPeak(phantom, { id: nod3.id })
// 		const peak2 = getPeak(phantom, { id: nod2.id })
// 		const peak1 = getPeak(phantom, { id: nod1.id })

// 		assertEquals(peak4.result, true)
// 		assertEquals(peak3.result, true)
// 		assertEquals(peak2.result, false)
// 		assertEquals(peak1.result, true)

// 		const peak4before = getPeak(phantom, { id: nod4.id, timing: -1 })
// 		const peak3before = getPeak(phantom, { id: nod3.id, timing: -1 })
// 		const peak2before = getPeak(phantom, { id: nod2.id, timing: -1 })
// 		const peak1before = getPeak(phantom, { id: nod1.id, timing: -1 })

// 		assertEquals(peak4before.result, false)
// 		assertEquals(peak3before.result, true)
// 		assertEquals(peak2before.result, true)
// 		assertEquals(peak1before.result, true)

// 		const peak4after = getPeak(phantom, { id: nod4.id, timing: 1 })
// 		const peak3after = getPeak(phantom, { id: nod3.id, timing: 1 })
// 		const peak2after = getPeak(phantom, { id: nod2.id, timing: 1 })
// 		const peak1after = getPeak(phantom, { id: nod1.id, timing: 1 })

// 		assertEquals(peak4after.result, false)
// 		assertEquals(peak3after.result, true)
// 		assertEquals(peak2after.result, false)
// 		assertEquals(peak1after.result, false)
// 	})
// })

// describe("sugar API functions", () => {
// 	it("adds a full pulse", () => {
// 		const phantom = createPhantom()
// 		const nod = createNod(phantom)
// 		assert(!nod.pulses.blue)
// 		assert(!nod.pulses.red)
// 		assert(!nod.pulses.green)
// 		addFullPulse(phantom, { id: nod.id })
// 		assert(nod.pulses.blue)
// 		assert(nod.pulses.red)
// 		assert(nod.pulses.green)
// 	})

// 	it("gets a full peak", () => {
// 		const phantom = createPhantom()
// 		const nod = createNod(phantom)
// 		const fullPeak = getFullPeak(phantom, { id: nod.id })
// 		assertEquals(fullPeak.blue.result, false)
// 		assertEquals(fullPeak.red.result, false)
// 		assertEquals(fullPeak.green.result, false)
// 		addFullPulse(phantom, { id: nod.id })
// 		const fullPeak2 = getFullPeak(phantom, { id: nod.id })
// 		assertEquals(fullPeak2.blue.result, true)
// 		assertEquals(fullPeak2.red.result, true)
// 		assertEquals(fullPeak2.green.result, true)
// 	})
// })

// describe("pulse colour", () => {
// 	it("only fires pulses through the same colour wire", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, colour: "red" })

// 		addPulse(phantom, { id: nod1.id, colour: "green" })
// 		const peakGreen = getPeak(phantom, { id: nod2.id, colour: "green" })
// 		const peakRed = getPeak(phantom, { id: nod2.id, colour: "red" })
// 		assertEquals(peakGreen.result, false)
// 		assertEquals(peakRed.result, false)

// 		addPulse(phantom, { id: nod1.id, colour: "red" })
// 		const peakGreen2 = getPeak(phantom, { id: nod2.id, colour: "green" })
// 		const peakRed2 = getPeak(phantom, { id: nod2.id, colour: "red" })
// 		assertEquals(peakGreen2.result, false)
// 		assertEquals(peakRed2.result, true)
// 	})
// })

// describe("advancing time", () => {
// 	it("unfires pulses", () => {
// 		const phantom = createPhantom()
// 		const nod = createNod(phantom)
// 		addPulse(phantom, { id: nod.id })
// 		assert(nod.pulses.blue)
// 		const advanced = advance(phantom).parent

// 		const nodAfter = getNod(advanced, nod.id)
// 		assert(!nodAfter.pulses.blue)
// 	})

// 	it("fires nods that would have get fired from the present", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1 })

// 		addPulse(phantom, { id: nod1.id })
// 		assert(nod1.pulses.blue)
// 		assert(!nod2.pulses.blue)

// 		const advanced = advance(phantom).parent
// 		const nod1After = getNod(advanced, nod1.id)
// 		const nod2After = getNod(advanced, nod2.id)

// 		assert(!nod1After.pulses.blue)
// 		assert(nod2After.pulses.blue)
// 	})

// 	it("fires nods that get fired from the future", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		const nod4 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1 })
// 		createWire(phantom, { source: nod2.id, target: nod3.id, timing: 1 })
// 		createWire(phantom, { source: nod3.id, target: nod4.id, timing: -1 })

// 		addPulse(phantom, { id: nod1.id })
// 		assert(nod1.pulses.blue)
// 		assert(!nod2.pulses.blue)
// 		assert(!nod3.pulses.blue)
// 		assert(!nod4.pulses.blue)

// 		const advanced = advance(phantom).parent
// 		const nod1After = getNod(advanced, nod1.id)
// 		const nod2After = getNod(advanced, nod2.id)
// 		const nod3After = getNod(advanced, nod3.id)
// 		const nod4After = getNod(advanced, nod4.id)

// 		assert(!nod1After.pulses.blue)
// 		assert(nod2After.pulses.blue)
// 		assert(!nod3After.pulses.blue)
// 		assert(nod4After.pulses.blue)

// 		const advanced2 = advance(advanced, { history: [phantom] }).parent
// 		const nod1After2 = getNod(advanced2, nod1.id)
// 		const nod3After2 = getNod(advanced2, nod3.id)
// 		const nod2After2 = getNod(advanced2, nod2.id)
// 		const nod4After2 = getNod(advanced2, nod4.id)

// 		assert(!nod1After2.pulses.blue)
// 		assert(!nod2After2.pulses.blue)
// 		assert(nod3After2.pulses.blue)
// 		assert(!nod4After2.pulses.blue)
// 	})

// 	it("fires nods that get fired from the real past", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		const nod3 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1 })
// 		createWire(phantom, { source: nod2.id, target: nod3.id, timing: 1 })

// 		const past = project(phantom)
// 		addPulse(past, { id: nod1.id })

// 		const nod1Before = getNod(past, nod1.id)
// 		const nod2Before = getNod(past, nod2.id)
// 		const nod3Before = getNod(past, nod3.id)
// 		assert(nod1Before.pulses.blue)
// 		assert(!nod2Before.pulses.blue)
// 		assert(!nod3Before.pulses.blue)

// 		assert(!nod1.pulses.blue)
// 		assert(!nod2.pulses.blue)
// 		assert(!nod3.pulses.blue)

// 		const advanced = advance(phantom, { history: [past] }).parent
// 		const nod1After = getNod(advanced, nod1.id)
// 		const nod2After = getNod(advanced, nod2.id)
// 		const nod3After = getNod(advanced, nod3.id)

// 		assert(!nod1After.pulses.blue)
// 		assert(!nod2After.pulses.blue)
// 		assert(nod3After.pulses.blue)
// 	})

// 	it("doesn't fire pulses through the wrong colour wire over time", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1, colour: "red" })

// 		addPulse(phantom, { id: nod1.id, colour: "green" })

// 		const advanced = advance(phantom).parent
// 		const peakGreen = getPeak(advanced, { id: nod2.id, colour: "green" })
// 		const peakRed = getPeak(advanced, { id: nod2.id, colour: "red" })
// 		assertEquals(peakGreen.result, false)
// 		assertEquals(peakRed.result, false)
// 	})

// 	it("fires pulses through the right colour wire over time", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		createWire(phantom, { source: nod1.id, target: nod2.id, timing: 1, colour: "red" })

// 		addPulse(phantom, { id: nod1.id, colour: "red" })

// 		const advanced = advance(phantom).parent
// 		const peakGreen = getPeak(advanced, { id: nod2.id, colour: "green" })
// 		const peakRed = getPeak(advanced, { id: nod2.id, colour: "red" })
// 		assertEquals(peakGreen.result, false)
// 		assertEquals(peakRed.result, true)
// 	})

// 	it("peaks after advancing time", () => {
// 		const phantom = createPhantom()
// 		const source = createNod(phantom)
// 		const target = createNod(phantom)
// 	})
// })

// describe("peak template", () => {
// 	it("gets the template of a peak's nod", () => {
// 		const phantom = createPhantom()
// 		const nod = createNod(phantom, { position: [1, 0] })
// 		addPulse(phantom, { id: nod.id })
// 		const peak = getPeak(phantom, { id: nod.id })
// 		if (!peak.result) {
// 			throw new Error("Peak should have fired")
// 		}
// 		assertEquals(peak.template, createTemplate(nod))
// 	})
// })

// describe("creation nod", () => {
// 	it("doesn't transform an any pulse while on itself", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		addPulse(phantom, { id: creation.id })
// 		const peak = getPeak(phantom, { id: creation.id })
// 		if (!peak.result) {
// 			throw new Error("Peak should have fired")
// 		}
// 		assertEquals(peak.type, "any")
// 	})

// 	it("transforms an any pulse into a creation pulse", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const any = createNod(phantom, { type: "any", position: [2, 0] })
// 		createWire(phantom, { source: creation.id, target: any.id })
// 		addPulse(phantom, { id: creation.id })
// 		const peak = getPeak(phantom, { id: any.id })
// 		if (!peak.result) {
// 			throw new Error("Peak should have fired")
// 		}
// 		assertEquals(peak.type, "creation")
// 	})

// 	it("modifies when advancing", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [2, 0] })
// 		createWire(phantom, { source: creation.id, target: slot.id, timing: 1 })
// 		addPulse(phantom, { id: creation.id })
// 		const advanced = advance(phantom).parent
// 		const recording = getNod(advanced, slot.id)
// 		assertEquals(recording.type, "recording")
// 	})

// 	it("modifies when advancing, with gaps", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const any = createNod(phantom, { type: "any", position: [2, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 		createWire(phantom, { source: creation.id, target: any.id, timing: 1 })
// 		createWire(phantom, { source: any.id, target: slot.id, timing: 1 })
// 		addPulse(phantom, { id: creation.id })
// 		const advanced = advance(phantom).parent
// 		const peak = getPeak(advanced, { id: any.id, history: [phantom] })
// 		if (!peak.result) {
// 			throw new Error("Peak should have fired")
// 		}
// 		assertEquals(peak.type, "creation")
// 		const advanced2 = advance(advanced, { history: [phantom] }).parent
// 		const recording = getNod(advanced2, slot.id)
// 		assertEquals(recording.type, "recording")
// 	})

// 	it("modifies in the present", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [2, 0] })
// 		createWire(phantom, { source: creation.id, target: slot.id })
// 		addPulse(phantom, { id: creation.id })
// 		const recording = getNod(phantom, slot.id)
// 		assertEquals(recording.type, "recording")
// 	})

// 	it("modifies in the present, with gaps", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const any = createNod(phantom, { type: "any", position: [2, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 		createWire(phantom, { source: creation.id, target: any.id })
// 		createWire(phantom, { source: any.id, target: slot.id })
// 		addPulse(phantom, { id: creation.id })
// 		const recording = getNod(phantom, slot.id)
// 		assertEquals(recording.type, "recording")
// 	})

// 	it("clones cloneable nods", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const destruction = createNod(phantom, { type: "destruction", position: [2, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 		createWire(phantom, { source: creation.id, target: destruction.id })
// 		createWire(phantom, { source: destruction.id, target: slot.id })
// 		addPulse(phantom, { id: creation.id })
// 		const clone = getNod(phantom, slot.id)
// 		assertEquals(clone.type, "destruction")
// 	})

// 	it("creates immediately through the past", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const any = createNod(phantom, { type: "any", position: [2, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 		createWire(phantom, { source: creation.id, target: any.id, timing: -1 })
// 		createWire(phantom, { source: any.id, target: slot.id, timing: 1 })
// 		addPulse(phantom, { id: creation.id })
// 		const recording = getNod(phantom, slot.id)
// 		assertEquals(recording.type, "recording")
// 	})

// 	it("creates immediately through the future", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const any = createNod(phantom, { type: "any", position: [2, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 		createWire(phantom, { source: creation.id, target: any.id, timing: 1 })
// 		createWire(phantom, { source: any.id, target: slot.id, timing: -1 })
// 		addPulse(phantom, { id: creation.id })
// 		const recording = getNod(phantom, slot.id)
// 		assertEquals(recording.type, "recording")
// 	})

// 	it("clones immediately through the past", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const destruction = createNod(phantom, { type: "destruction", position: [2, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 		createWire(phantom, { source: creation.id, target: destruction.id, timing: -1 })
// 		createWire(phantom, { source: destruction.id, target: slot.id, timing: 1 })
// 		addPulse(phantom, { id: creation.id })
// 		const clone = getNod(phantom, slot.id)
// 		assertEquals(clone.type, "destruction")
// 	})

// 	it("clones immediately through the future", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 		const destruction = createNod(phantom, { type: "destruction", position: [2, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 		createWire(phantom, { source: creation.id, target: destruction.id, timing: 1 })
// 		createWire(phantom, { source: destruction.id, target: slot.id, timing: -1 })
// 		addPulse(phantom, { id: creation.id })
// 		const clone = getNod(phantom, slot.id)
// 		assertEquals(clone.type, "destruction")
// 	})

// 	it("handles simultanous creations in order of creation", () => {
// 		{
// 			const phantom = createPhantom()
// 			const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 			const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 			const destruction = createNod(phantom, { type: "destruction", position: [4, 0] })
// 			createWire(phantom, { source: creation.id, target: slot.id, timing: 1 })
// 			createWire(phantom, { source: creation.id, target: destruction.id, timing: 1 })
// 			createWire(phantom, { source: destruction.id, target: slot.id })
// 			addPulse(phantom, { id: creation.id })
// 			const advanced = advance(phantom).parent
// 			const created = getNod(advanced, slot.id)
// 			assertEquals(created.type, "recording")
// 		}
// 		{
// 			const phantom = createPhantom()
// 			const creation = createNod(phantom, { type: "creation", position: [1, 0] })
// 			const slot = createNod(phantom, { type: "slot", position: [3, 0] })
// 			const destruction = createNod(phantom, { type: "destruction", position: [4, 0] })
// 			createWire(phantom, { source: creation.id, target: destruction.id, timing: 1 })
// 			createWire(phantom, { source: destruction.id, target: slot.id })
// 			createWire(phantom, { source: creation.id, target: slot.id, timing: 1 })
// 			addPulse(phantom, { id: creation.id })
// 			const advanced = advance(phantom).parent
// 			const created = getNod(advanced, slot.id)
// 			assertEquals(created.type, "destruction")
// 		}
// 	})

// 	it("ends instant pulse at slot", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [0, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [1, 0] })
// 		const other = createNod(phantom, { position: [2, 0] })
// 		createWire(phantom, { source: creation.id, target: slot.id })
// 		createWire(phantom, { source: slot.id, target: other.id })
// 		addPulse(phantom, { id: creation.id })
// 		assertEquals(slot.type, "recording")
// 		assertEquals(slot.pulses.blue, null)
// 		assertEquals(other.pulses.blue, null)
// 	})

// 	it("ends delayed pulse at slot", () => {
// 		const phantom = createPhantom()
// 		const creation = createNod(phantom, { type: "creation", position: [0, 0] })
// 		const slot = createNod(phantom, { type: "slot", position: [1, 0] })
// 		const other = createNod(phantom, { position: [2, 0] })
// 		createWire(phantom, { source: creation.id, target: slot.id, timing: 1 })
// 		createWire(phantom, { source: slot.id, target: other.id })
// 		addPulse(phantom, { id: creation.id })
// 		const advanced = advance(phantom).parent
// 		const created = getNod(advanced, slot.id)
// 		const otherAfter = getNod(advanced, other.id)
// 		assertEquals(created.type, "recording")
// 		assertEquals(created.pulses.blue, null)
// 		assertEquals(otherAfter.pulses.blue, null)
// 	})
// })

// describe("deep advancing and propogating", () => {
// 	it("doesn't project non-firing children", () => {
// 		const phantom = createPhantom()
// 		const child = createNod(phantom)
// 		const grandChild = createNod(child)
// 		addPulse(child, { id: grandChild.id })
// 		const advanced = deepAdvance(phantom).parent
// 		const childAfter = getNod(advanced, child.id)
// 		const grandChildAfter = getNod(childAfter, grandChild.id)
// 		assert(grandChildAfter.pulses.blue)
// 	})

// 	it("projects firing children", () => {
// 		const phantom = createPhantom()
// 		const child = createNod(phantom)
// 		const grandChild = createNod(child)
// 		addPulse(phantom, { id: child.id })
// 		addPulse(child, { id: grandChild.id })
// 		const advanced = deepAdvance(phantom).parent
// 		const childAfter = getNod(advanced, child.id)
// 		const grandChildAfter = getNod(childAfter, grandChild.id)
// 		assert(!grandChildAfter.pulses.blue)
// 	})

// 	it("propogates firing children, depending on the past", () => {
// 		const phantom = createPhantom()
// 		const child = createNod(phantom)
// 		const source = createNod(child)
// 		const target = createNod(child)
// 		createWire(child, { source: source.id, target: target.id, timing: 1 })
// 		addPulse(child, { id: source.id })
// 		addPulse(phantom, { id: child.id })
// 		const advanced = deepAdvance(phantom, { history: [phantom] }).parent
// 		const childAfter = getNod(advanced, child.id)
// 		const targetAfter = getNod(childAfter, target.id)
// 		const sourceAfter = getNod(childAfter, source.id)
// 		assert(child.pulses.blue)
// 		assert(source.pulses.blue)
// 		assert(!target.pulses.blue)

// 		assert(!childAfter.pulses.blue)
// 		assert(!sourceAfter.pulses.blue)
// 		assert(targetAfter.pulses.blue)
// 	})

// 	it("propogates firing children, depending on the future", () => {
// 		const phantom = createPhantom()
// 		const child = createNod(phantom)
// 		const nod1 = createNod(child)
// 		const nod2 = createNod(child)
// 		const nod3 = createNod(child)
// 		const nod4 = createNod(child)
// 		createWire(child, { source: nod1.id, target: nod2.id, timing: 1 })
// 		createWire(child, { source: nod2.id, target: nod3.id, timing: 1 })
// 		createWire(child, { source: nod3.id, target: nod4.id, timing: -1 })
// 		addPulse(phantom, { id: child.id })
// 		addPulse(child, { id: nod1.id })
// 		const advanced = deepAdvance(phantom).parent
// 		const childAfter = getNod(advanced, child.id)
// 		const nod1After = getNod(childAfter, nod1.id)
// 		const nod2After = getNod(childAfter, nod2.id)
// 		const nod3After = getNod(childAfter, nod3.id)
// 		const nod4After = getNod(childAfter, nod4.id)
// 		assert(nod1.pulses.blue)
// 		assert(!nod2.pulses.blue)
// 		assert(!nod3.pulses.blue)
// 		assert(!nod4.pulses.blue)

// 		assert(!nod1After.pulses.blue)
// 		assert(nod2After.pulses.blue)
// 		assert(!nod3After.pulses.blue)
// 		assert(nod4After.pulses.blue)
// 	})
// })

// describe("operation reports", () => {
// 	it("reports a fired nod", () => {
// 		const phantom = createPhantom()
// 		const nod = createNod(phantom)
// 		addPulse(phantom, { id: nod.id })
// 		const { operations } = deepAdvance(phantom)
// 		assertEquals(operations.length, 1)
// 		const [operation] = operations
// 		assertEquals(operation.type, "fired")
// 	})

// 	it("reports all fired nods on the layer", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom)
// 		const nod2 = createNod(phantom)
// 		addPulse(phantom, { id: nod1.id })
// 		addPulse(phantom, { id: nod2.id })
// 		const { operations } = deepAdvance(phantom)
// 		assertEquals(operations.length, 2)
// 		const [operation1, operation2] = operations
// 		assertEquals(operation1.type, "fired")
// 		assertEquals(operation2.type, "fired")
// 	})

// 	it("reports a fired child nod", () => {
// 		const phantom = createPhantom()
// 		const nod1 = createNod(phantom, { position: [1, 0] })
// 		const nod2 = createNod(nod1, { position: [2, 0] })
// 		addPulse(phantom, { id: nod1.id })
// 		addPulse(nod1, { id: nod2.id })
// 		const { operations } = deepAdvance(phantom)
// 		assertEquals(operations.length, 2)
// 	})
// })
