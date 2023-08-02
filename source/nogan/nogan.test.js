// @ts-expect-error
import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts"
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
	getAdvanced,
	getCell,
	getCells,
	getClone,
	getPeak,
	getProjectedNogan,
	getRoot,
	getWire,
	getWires,
	giveChild,
	isFiring,
	iterateCells,
	iterateWires,
	modifyCell,
	modifyWire,
	refresh,
	reserveCellId,
	reserveWireId,
} from "./nogan.js"

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
	})

	it("reserves a wire id", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		assertEquals(id1, -1)
	})

	it("deletes a cell id", () => {
		const nogan = createNogan()
		const id1 = reserveCellId(nogan)
		assertEquals(id1, 1)
		deleteCellId(nogan, id1)
		assertEquals(nogan.deletedCells, [1])
	})

	it("deletes a wire id", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		assertEquals(id1, -1)
		deleteWireId(nogan, id1)
		assertEquals(nogan.deletedWires, [-1])
	})

	it("reuses a cell id", () => {
		const nogan = createNogan()
		const id1 = reserveCellId(nogan)
		assertEquals(id1, 1)
		deleteCellId(nogan, id1)
		const id2 = reserveCellId(nogan)
		assertEquals(id2, 1)
	})

	it("reuses a wire id", () => {
		const nogan = createNogan()
		const id1 = reserveWireId(nogan)
		assertEquals(id1, -1)
		deleteWireId(nogan, id1)
		const id2 = reserveWireId(nogan)
		assertEquals(id2, -1)
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
		modifyCell(nogan, { id: cell.id, type: "creation", position: [10, 20], propogate: false })
		assertEquals(cell.type, "creation")
		assertEquals(cell.position, [10, 20])
	})
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
		modifyWire(nogan, { id: wire.id, timing: 1, colour: "red", propogate: false })
		assertEquals(wire.timing, 1)
		assertEquals(wire.colour, "red")
	})
})

describe("firing", () => {
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
		fireCell(nogan, { id: cell.id, propogate: false })
		assertEquals(cell.fire.blue, { type: "raw" })
		assertEquals(cell.fire.green, null)
	})
})

describe("projecting", () => {
	it("clones a nogan", () => {
		const nogan = createNogan()
		const projection = getProjectedNogan(nogan)
		assertEquals(projection, { ...nogan, type: "projection", json: projection.json })
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

	it("ends fires of children", () => {
		const nogan = createNogan()
		const parent = createCell(nogan)
		const child = createCell(nogan, { parent: parent.id })
		fireCell(nogan, { id: parent.id })
		fireCell(nogan, { id: child.id })
		assertEquals(parent.fire.blue, { type: "raw" })
		assertEquals(child.fire.blue, { type: "raw" })

		const projection = getProjectedNogan(nogan)
		const projectedParent = getCell(projection, parent.id)
		const projectedChild = getCell(projection, child.id)
		assertEquals(projectedParent.fire.blue, null)
		assertEquals(projectedChild.fire.blue, null)
	})

	it("only ends fires of children with firing parents", () => {
		const nogan = createNogan()
		const parent = createCell(nogan)
		const child = createCell(nogan, { parent: parent.id })
		fireCell(nogan, { id: child.id })
		assertEquals(parent.fire.blue, null)
		assertEquals(child.fire.blue, { type: "raw" })

		const projection = getProjectedNogan(nogan)
		const projectedParent = getCell(projection, parent.id)
		const projectedChild = getCell(projection, child.id)
		assertEquals(projectedParent.fire.blue, null)
		assertEquals(projectedChild.fire.blue, { type: "raw" })
	})
})

describe("peaking", () => {
	it("creates a peak", () => {
		const peak = createPeak()
		assertEquals(peak, { result: false, operations: [] })
	})

	it("checks if a cell is firing", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		assertEquals(isFiring(nogan, { id: cell.id }), false)
		fireCell(nogan, { id: cell.id, propogate: false })
		assertEquals(isFiring(nogan, { id: cell.id }), true)
	})

	it("finds a real pulse in the present", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		const peak1 = getPeak(nogan, { id: cell.id })
		assertEquals(peak1.result, false)
		fireCell(nogan, { id: cell.id, propogate: false })
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
		fireCell(before1, { id: cell.id, propogate: false })
		const peak1 = getPeak(nogan, { id: cell.id, timing: -1, past: [before1] })
		const peak2 = getPeak(nogan, { id: cell.id, timing: -1, past: [before2] })
		assertEquals(peak1.result, true)
		assertEquals(peak2.result, false)
	})

	it("finds a real pulse in the future", () => {
		const nogan = createNogan()
		const cell = createCell(nogan)
		const after1 = structuredClone(nogan)
		const after2 = structuredClone(nogan)
		fireCell(after1, { id: cell.id, propogate: false })
		const peak1 = getPeak(nogan, { id: cell.id, timing: 1, future: [after1] })
		const peak2 = getPeak(nogan, { id: cell.id, timing: 1, future: [after2] })
		assertEquals(peak1.result, true)
		assertEquals(peak2.result, false)
	})

	it("finds a pulse caused by the real present", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id })

		const peakSource1 = getPeak(nogan, { id: target.id })
		const peakTarget1 = getPeak(nogan, { id: target.id })
		assertEquals(peakSource1.result, false)
		assertEquals(peakTarget1.result, false)

		fireCell(nogan, { id: source.id, propogate: false })
		const peakSource2 = getPeak(nogan, { id: target.id })
		const peakTarget2 = getPeak(nogan, { id: target.id })
		assertEquals(peakSource2.result, true)
		assertEquals(peakTarget2.result, true)
	})

	it("finds a pulse caused by the real past", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id, timing: 1 })

		const peakSource1 = getPeak(nogan, { id: target.id })
		const peakTarget1 = getPeak(nogan, { id: target.id })
		assertEquals(peakSource1.result, false)
		assertEquals(peakTarget1.result, false)

		const before = structuredClone(nogan)
		fireCell(before, { id: source.id, propogate: false })
		const peakSource2 = getPeak(nogan, { id: target.id, past: [before] })
		const peakTarget2 = getPeak(nogan, { id: target.id, past: [before] })
		assertEquals(peakSource2.result, true)
		assertEquals(peakTarget2.result, true)
	})

	it("finds a pulse caused by the real future", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id, timing: -1 })

		const peakSource1 = getPeak(nogan, { id: target.id })
		const peakTarget1 = getPeak(nogan, { id: target.id })
		assertEquals(peakSource1.result, false)
		assertEquals(peakTarget1.result, false)

		const after = structuredClone(nogan)
		fireCell(after, { id: source.id, propogate: false })
		const peakSource2 = getPeak(nogan, { id: target.id, future: [after] })
		const peakTarget2 = getPeak(nogan, { id: target.id, future: [after] })
		assertEquals(peakSource2.result, true)
		assertEquals(peakTarget2.result, true)
	})

	it("finds a pulse caused by an imagined future", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: 1 })
		createWire(nogan, { source: cell2.id, target: cell3.id, timing: -1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id, timing: 1 })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id, timing: 1 })
		const peak23 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, true)
		assertEquals(peak23.result, true)
	})

	it("finds a pulse caused by an imagined past", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell3.id, timing: 1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id, timing: -1 })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak13.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak11.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id, timing: -1 })
		const peak23 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak23.result, true)
		assertEquals(peak22.result, true)
		assertEquals(peak21.result, true)
	})

	it("finds a pulse two beats away in the real past", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: 1 })
		createWire(nogan, { source: cell2.id, target: cell3.id, timing: 1 })
		const peak12 = getPeak(nogan, { id: cell2.id, timing: -1 })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)

		const beforeBefore = structuredClone(nogan)
		fireCell(beforeBefore, { id: cell1.id, propogate: false })

		const peak22 = getPeak(nogan, { id: cell2.id, past: [nogan, beforeBefore], timing: -1 })
		const peak23 = getPeak(nogan, { id: cell3.id, past: [nogan, beforeBefore] })
		assertEquals(peak22.result, true)
		assertEquals(peak23.result, true)
	})

	it("finds a pulse two beats in an imagined past", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		const cell4 = createCell(nogan)
		const cell5 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell3.id, timing: -1 })
		createWire(nogan, { source: cell3.id, target: cell4.id, timing: 1 })
		createWire(nogan, { source: cell4.id, target: cell5.id, timing: 1 })
		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id, timing: -1 })
		const peak14 = getPeak(nogan, { id: cell4.id, timing: -1 })
		const peak15 = getPeak(nogan, { id: cell5.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak14.result, false)
		assertEquals(peak15.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id, timing: -1 })
		const peak24 = getPeak(nogan, { id: cell4.id, timing: -1 })
		const peak25 = getPeak(nogan, { id: cell5.id })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, true)
		assertEquals(peak24.result, true)
		assertEquals(peak25.result, true)
	})

	it("finds a pulse two beats in an imagined future", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		const cell4 = createCell(nogan)
		const cell5 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: 1 })
		createWire(nogan, { source: cell2.id, target: cell3.id, timing: 1 })
		createWire(nogan, { source: cell3.id, target: cell4.id, timing: -1 })
		createWire(nogan, { source: cell4.id, target: cell5.id, timing: -1 })
		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id, timing: 1 })
		const peak14 = getPeak(nogan, { id: cell4.id, timing: 1 })
		const peak15 = getPeak(nogan, { id: cell5.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak14.result, false)
		assertEquals(peak15.result, false)
		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id, timing: 1 })
		const peak24 = getPeak(nogan, { id: cell4.id, timing: 1 })
		const peak25 = getPeak(nogan, { id: cell5.id })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, true)
		assertEquals(peak24.result, true)
		assertEquals(peak25.result, true)
	})

	it("peaks in a recursive past without crashing", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: 1 })
		createWire(nogan, { source: cell2.id, target: cell1.id, timing: 1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		assertEquals(cell1.fire.blue, { type: "raw" })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, false)
	})

	it("peaks in a recursive future without crashing", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell1.id, timing: -1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		assertEquals(cell1.fire.blue, { type: "raw" })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, false)
	})

	it("peaks in a deep recursive past without crashing", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: 1 })
		createWire(nogan, { source: cell2.id, target: cell3.id, timing: 1 })
		createWire(nogan, { source: cell3.id, target: cell1.id, timing: 1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		assertEquals(cell1.fire.blue, { type: "raw" })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, false)
		assertEquals(peak23.result, false)
	})

	it("peaks in a deep recursive future without crashing", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell3.id, timing: -1 })
		createWire(nogan, { source: cell3.id, target: cell1.id, timing: -1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		assertEquals(cell1.fire.blue, { type: "raw" })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, false)
		assertEquals(peak23.result, false)
	})

	it("finds a pulse in a recursive past", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: 1 })
		createWire(nogan, { source: cell2.id, target: cell1.id, timing: 1 })
		createWire(nogan, { source: cell3.id, target: cell1.id, timing: -1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)

		fireCell(nogan, { id: cell3.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		assertEquals(cell3.fire.blue, { type: "raw" })
		assertEquals(peak21.result, false)
		assertEquals(peak22.result, true)
		assertEquals(peak23.result, true)
	})

	it("finds a pulse in a recursive future", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell1.id, timing: -1 })
		createWire(nogan, { source: cell3.id, target: cell1.id, timing: 1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)

		fireCell(nogan, { id: cell3.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		assertEquals(cell3.fire.blue, { type: "raw" })
		assertEquals(peak21.result, false)
		assertEquals(peak22.result, true)
		assertEquals(peak23.result, true)
	})

	it("finds a pulse in a deep recursive past", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		const cell4 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: 1 })
		createWire(nogan, { source: cell2.id, target: cell1.id, timing: 1 })
		createWire(nogan, { source: cell3.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell4.id, target: cell3.id, timing: -1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		const peak14 = getPeak(nogan, { id: cell4.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)
		assertEquals(peak14.result, false)

		fireCell(nogan, { id: cell4.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		const peak24 = getPeak(nogan, { id: cell4.id })
		assertEquals(cell4.fire.blue, { type: "raw" })
		assertEquals(peak21.result, false)
		assertEquals(peak22.result, true)
		assertEquals(peak23.result, false)
		assertEquals(peak24.result, true)

		const peak21before = getPeak(nogan, { id: cell1.id, timing: -1 })
		const peak22before = getPeak(nogan, { id: cell2.id, timing: -1 })
		const peak23before = getPeak(nogan, { id: cell3.id, timing: -1 })
		const peak24before = getPeak(nogan, { id: cell4.id, timing: -1 })
		assertEquals(peak21before.result, true)
		assertEquals(peak22before.result, false)
		assertEquals(peak23before.result, true)
		assertEquals(peak24before.result, false)

		const peak21after = getPeak(nogan, { id: cell1.id, timing: 1 })
		const peak22after = getPeak(nogan, { id: cell2.id, timing: 1 })
		const peak23after = getPeak(nogan, { id: cell3.id, timing: 1 })
		const peak24after = getPeak(nogan, { id: cell4.id, timing: 1 })
		assertEquals(peak21after.result, true)
		assertEquals(peak22after.result, false)
		assertEquals(peak23after.result, false)
		assertEquals(peak24after.result, false)
	})

	it("finds a pulse in a deep recursive future", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		const cell4 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell1.id, timing: -1 })
		createWire(nogan, { source: cell3.id, target: cell2.id, timing: 1 })
		createWire(nogan, { source: cell4.id, target: cell3.id, timing: 1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		const peak14 = getPeak(nogan, { id: cell4.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)
		assertEquals(peak14.result, false)

		fireCell(nogan, { id: cell4.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		const peak24 = getPeak(nogan, { id: cell4.id })
		assertEquals(cell4.fire.blue, { type: "raw" })
		assertEquals(peak21.result, false)
		assertEquals(peak22.result, true)
		assertEquals(peak23.result, false)
		assertEquals(peak24.result, true)

		const peak21before = getPeak(nogan, { id: cell1.id, timing: -1 })
		const peak22before = getPeak(nogan, { id: cell2.id, timing: -1 })
		const peak23before = getPeak(nogan, { id: cell3.id, timing: -1 })
		const peak24before = getPeak(nogan, { id: cell4.id, timing: -1 })
		assertEquals(peak21before.result, true)
		assertEquals(peak22before.result, false)
		assertEquals(peak23before.result, false)
		assertEquals(peak24before.result, false)

		const peak21after = getPeak(nogan, { id: cell1.id, timing: 1 })
		const peak22after = getPeak(nogan, { id: cell2.id, timing: 1 })
		const peak23after = getPeak(nogan, { id: cell3.id, timing: 1 })
		const peak24after = getPeak(nogan, { id: cell4.id, timing: 1 })
		assertEquals(peak21after.result, true)
		assertEquals(peak22after.result, false)
		assertEquals(peak23after.result, true)
		assertEquals(peak24after.result, false)
	})

	it("finds a pulse in a recursive time loop", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		const cell4 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell3.id, timing: 1 })
		createWire(nogan, { source: cell3.id, target: cell1.id, timing: -1 })
		createWire(nogan, { source: cell4.id, target: cell3.id, timing: 1 })

		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		const peak14 = getPeak(nogan, { id: cell4.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)
		assertEquals(peak14.result, false)

		fireCell(nogan, { id: cell4.id, propogate: false })

		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		const peak24 = getPeak(nogan, { id: cell4.id })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, false)
		assertEquals(peak23.result, true)
		assertEquals(peak24.result, true)

		const peak21before = getPeak(nogan, { id: cell1.id, timing: -1 })
		const peak22before = getPeak(nogan, { id: cell2.id, timing: -1 })
		const peak23before = getPeak(nogan, { id: cell3.id, timing: -1 })
		const peak24before = getPeak(nogan, { id: cell4.id, timing: -1 })
		assertEquals(peak21before.result, true)
		assertEquals(peak22before.result, true)
		assertEquals(peak23before.result, true)
		assertEquals(peak24before.result, false)
	})

	it("peaks at a wire loop in the present", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id })
		createWire(nogan, { source: cell2.id, target: cell1.id })
		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, true)
	})

	it("peaks at a deep wire loop in the present", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id })
		createWire(nogan, { source: cell2.id, target: cell3.id })
		createWire(nogan, { source: cell3.id, target: cell1.id })
		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, true)
		assertEquals(peak23.result, true)
	})

	it("peaks at a wire loop that goes across time", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell1.id, timing: 1 })
		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, false)
	})

	it("peaks at a deep wire loop that goes across time", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		const cell3 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, timing: -1 })
		createWire(nogan, { source: cell2.id, target: cell3.id })
		createWire(nogan, { source: cell3.id, target: cell1.id, timing: 1 })
		const peak11 = getPeak(nogan, { id: cell1.id })
		const peak12 = getPeak(nogan, { id: cell2.id })
		const peak13 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)
		assertEquals(peak13.result, false)

		fireCell(nogan, { id: cell1.id, propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id })
		const peak22 = getPeak(nogan, { id: cell2.id })
		const peak23 = getPeak(nogan, { id: cell3.id })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, false)
		assertEquals(peak23.result, false)
	})
})

describe("pulse colour", () => {
	it("only sends pulses through the same colour wire", () => {
		const nogan = createNogan()
		const cell1 = createCell(nogan)
		const cell2 = createCell(nogan)
		createWire(nogan, { source: cell1.id, target: cell2.id, colour: "red" })

		const peak11 = getPeak(nogan, { id: cell1.id, colour: "green" })
		const peak12 = getPeak(nogan, { id: cell2.id, colour: "green" })
		assertEquals(peak11.result, false)
		assertEquals(peak12.result, false)

		fireCell(nogan, { id: cell1.id, colour: "green", propogate: false })
		const peak21 = getPeak(nogan, { id: cell1.id, colour: "green" })
		const peak22 = getPeak(nogan, { id: cell2.id, colour: "green" })
		assertEquals(peak21.result, true)
		assertEquals(peak22.result, false)

		const peak11red = getPeak(nogan, { id: cell1.id, colour: "red" })
		const peak12red = getPeak(nogan, { id: cell2.id, colour: "red" })
		assertEquals(peak11red.result, false)
		assertEquals(peak12red.result, false)

		fireCell(nogan, { id: cell1.id, colour: "red", propogate: false })
		const peak21red = getPeak(nogan, { id: cell1.id, colour: "red" })
		const peak22red = getPeak(nogan, { id: cell2.id, colour: "red" })
		assertEquals(peak21red.result, true)
		assertEquals(peak22red.result, true)
	})
})

describe("propogating", () => {
	it("propogates a firing through the present", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id })

		assertEquals(source.fire.blue, null)
		assertEquals(target.fire.blue, null)

		fireCell(nogan, { id: source.id })

		assertEquals(source.fire.blue, { type: "raw" })
		assertEquals(target.fire.blue, { type: "raw" })
	})

	it("propogates a firing through the past", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const middle = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: middle.id, timing: -1 })
		createWire(nogan, { source: middle.id, target: target.id, timing: 1 })
		assertEquals(source.fire.blue, null)
		assertEquals(middle.fire.blue, null)
		assertEquals(target.fire.blue, null)

		fireCell(nogan, { id: source.id })
		assertEquals(source.fire.blue, { type: "raw" })
		assertEquals(middle.fire.blue, null)
		assertEquals(target.fire.blue, { type: "raw" })
	})

	it("propogates a firing through the future", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const middle = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: middle.id, timing: 1 })
		createWire(nogan, { source: middle.id, target: target.id, timing: -1 })
		assertEquals(source.fire.blue, null)
		assertEquals(middle.fire.blue, null)
		assertEquals(target.fire.blue, null)

		fireCell(nogan, { id: source.id })
		assertEquals(source.fire.blue, { type: "raw" })
		assertEquals(middle.fire.blue, null)
		assertEquals(target.fire.blue, { type: "raw" })
	})

	it("propogates a wiring", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		fireCell(nogan, { id: source.id })
		assert(source.fire.blue)
		assert(!target.fire.blue)

		createWire(nogan, { source: source.id, target: target.id })
		assert(source.fire.blue)
		assert(target.fire.blue)
	})

	it("propogates a wire colour modification", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		const wire = createWire(nogan, { source: source.id, target: target.id, colour: "red" })
		fireCell(nogan, { id: source.id, colour: "green" })
		assert(source.fire.green)
		assert(!target.fire.green)

		modifyWire(nogan, { id: wire.id, colour: "green" })
		assert(source.fire.green)
		assert(target.fire.green)
	})

	it("propogates a wire timing modification", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		const wire = createWire(nogan, { source: source.id, target: target.id, timing: 1 })
		fireCell(nogan, { id: source.id })
		assert(source.fire.blue)
		assert(!target.fire.blue)

		modifyWire(nogan, { id: wire.id, timing: 0 })
		assert(source.fire.blue)
		assert(target.fire.blue)
	})

	it("propogates based on the past", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id, timing: 1 })

		const past = getClone(nogan)
		fireCell(past, { id: source.id })
		assert(!source.fire.blue)
		assert(!target.fire.blue)

		refresh(nogan, { past: [past] })
		assert(!source.fire.blue)
		assert(target.fire.blue)
	})

	it("propogates based on the future", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id, timing: -1 })

		const future = getClone(nogan)
		fireCell(future, { id: source.id })
		assert(!source.fire.blue)
		assert(!target.fire.blue)

		refresh(nogan, { future: [future] })
		assert(!source.fire.blue)
		assert(target.fire.blue)
	})
})

describe("advancing", () => {
	it("clones", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id })
		const advanced = getAdvanced(nogan)
		assertEquals(advanced, { ...nogan, json: advanced.json })
	})

	it("unfires cells", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id })
		fireCell(nogan, { id: source.id })
		assert(source.fire.blue)
		assert(target.fire.blue)
		const advanced = getAdvanced(nogan)
		const sourceAfter = getCell(advanced, source.id)
		const targetAfter = getCell(advanced, target.id)
		assert(!sourceAfter.fire.blue)
		assert(!targetAfter.fire.blue)
	})

	it("unfires cells with firing parents", () => {
		const nogan = createNogan()
		const parent = createCell(nogan)
		const child = createCell(nogan, { parent: parent.id })
		fireCell(nogan, { id: parent.id })
		fireCell(nogan, { id: child.id })
		assert(parent.fire.blue)
		assert(child.fire.blue)

		const advanced = getAdvanced(nogan)
		const parentAfter = getCell(advanced, parent.id)
		const childAfter = getCell(advanced, child.id)
		assert(!parentAfter.fire.blue)
		assert(!childAfter.fire.blue)
	})

	it("doesn't unfire cells with firing children", () => {
		const nogan = createNogan()
		const parent = createCell(nogan)
		const child = createCell(nogan, { parent: parent.id })
		fireCell(nogan, { id: child.id })
		assert(!parent.fire.blue)
		assert(child.fire.blue)

		const advanced = getAdvanced(nogan)
		const parentAfter = getCell(advanced, parent.id)
		const childAfter = getCell(advanced, child.id)
		assert(!parentAfter.fire.blue)
		assert(childAfter.fire.blue)
	})

	it("fires from the present", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: target.id, timing: 1 })
		fireCell(nogan, { id: source.id })
		assert(source.fire.blue)
		assert(!target.fire.blue)

		const advanced = getAdvanced(nogan)
		const sourceAfter = getCell(advanced, source.id)
		const targetAfter = getCell(advanced, target.id)
		assert(!sourceAfter.fire.blue)
		assert(targetAfter.fire.blue)
	})

	it("fires from the real past", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const middle = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: middle.id, timing: 1 })
		createWire(nogan, { source: middle.id, target: target.id, timing: 1 })

		const past = getClone(nogan)
		fireCell(past, { id: source.id })

		const advanced = getAdvanced(nogan, { past: [past] })
		const sourceAfter = getCell(advanced, source.id)
		const middleAfter = getCell(advanced, middle.id)
		const targetAfter = getCell(advanced, target.id)
		assert(!sourceAfter.fire.blue)
		assert(!middleAfter.fire.blue)
		assert(targetAfter.fire.blue)
	})

	it("fires from the imagined future", () => {
		const nogan = createNogan()
		const source = createCell(nogan)
		const middle1 = createCell(nogan)
		const middle2 = createCell(nogan)
		const target = createCell(nogan)
		createWire(nogan, { source: source.id, target: middle1.id, timing: 1 })
		createWire(nogan, { source: middle1.id, target: middle2.id, timing: 1 })
		createWire(nogan, { source: middle2.id, target: target.id, timing: -1 })
		fireCell(nogan, { id: source.id })

		const advanced = getAdvanced(nogan)
		const sourceAfter = getCell(advanced, source.id)
		const middle1After = getCell(advanced, middle1.id)
		const middle2After = getCell(advanced, middle2.id)
		const targetAfter = getCell(advanced, target.id)
		assert(!sourceAfter.fire.blue)
		assert(middle1After.fire.blue)
		assert(!middle2After.fire.blue)
		assert(targetAfter.fire.blue)
	})
})
describe.skip("operation")
describe.skip("creation pulse", () => {})
describe.skip("destruction pulse", () => {})

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
// 		const peak = getPeak(advanced, { id: any.id, past: [phantom] })
// 		if (!peak.result) {
// 			throw new Error("Peak should have fired")
// 		}
// 		assertEquals(peak.type, "creation")
// 		const advanced2 = advance(advanced, { past: [phantom] }).parent
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
