import { Schema } from "../../libraries/schema.js"

/** @type any */
export const NoganSchema = class extends Schema {}

const S = Schema
const N = NoganSchema

//=======//
// Enums //
//=======//
/** @type {Record<CellType, CellType>} */
export const CELL_TYPE = {
	dummy: "dummy",
	root: "root",
	slot: "slot",
	creation: "creation",
	destruction: "destruction",
	recording: "recording",
}

/** @type {Record<PulseType, PulseType>} */
export const PULSE_TYPE = {
	raw: "raw",
	creation: "creation",
	destruction: "destruction",
}

/** @type {Record<PulseColour, PulseColour>} */
export const PULSE_COLOUR = {
	blue: "blue",
	green: "green",
	red: "red",
}

/** @type {Record<WireColour, WireColour>} */
export const WIRE_COLOUR = {
	any: "any",
	blue: "blue",
	green: "green",
	red: "red",
}

/** @type {Record<Timing, Timing>} */
export const TIMING = {
	"0": 0,
	"-1": -1,
	"1": 1,
}

export const CELL_TYPES = Object.values(CELL_TYPE)
export const PULSE_TYPES = Object.values(PULSE_TYPE)
export const PULSE_COLOURS = Object.values(PULSE_COLOUR)
export const WIRE_COLOURS = Object.values(WIRE_COLOUR)
export const TIMINGS = Object.values(TIMING)

N.CellType = S.Enum(CELL_TYPES)
N.PulseType = S.Enum(PULSE_TYPES)
N.PulseColour = S.Enum(PULSE_COLOURS)
N.WireColour = S.Enum(WIRE_COLOURS)
N.Timing = S.Enum(TIMINGS)

//=========//
// Utility //
//=========//
N.CellTemplate = S.Struct({ type: N.CellType, position: S.Vector2D })

//=======//
// Pulse //
//=======//
N.BasePulse = S.Struct({
	type: N.PulseType,
})

N.RawPulse = N.BasePulse.combine({
	type: N.Value("raw"),
})

N.CreationPulse = N.BasePulse.combine({
	type: N.Value("creation"),
	template: N.CellTemplate,
})

N.DestructionPulse = N.BasePulse.combine({
	type: N.Value("destruction"),
})

N.Pulse = S.Any([N.RawPulse, N.CreationPulse, N.DestructionPulse])
N.Fire = S.Struct({
	red: N.Pulse.nullable(),
	green: N.Pulse.nullable(),
	blue: N.Pulse.nullable(),
})

//====//
// Id //
//====//
N.RootId = S.Value(0)
N.CellId = S.SafePositiveInteger
N.WireId = S.SafeNegativeInteger
N.Id = S.Any([N.RootId, N.CellId, N.WireId])

//======//
// Cell //
//======//
N.Cell = S.Struct({
	id: N.CellId.withDefault(null),
	parent: N.CellId.withDefault(null),
	type: N.CellType,
	position: S.Vector2D,
	cells: S.ArrayOf(N.CellId),
	inputs: S.ArrayOf(N.WireId),
	outputs: S.ArrayOf(N.WireId),
	fire: N.Fire,
}).andCheck((cell) => {
	if (cell.type === "root" && cell.id !== 0) {
		throw new Error("Root cell must have id 0")
	}

	if (cell.type !== "root" && cell.id === 0) {
		throw new Error("Non-root cell cannot have id 0")
	}

	const cellSet = new Set(cell.cells)
	if (cellSet.size !== cell.cells.length) {
		throw new Error("Cell contains duplicate cells")
	}

	for (const childId of cell.cells) {
		if (childId === cell.id) {
			throw new Error("Cell cannot contain itself")
		}
	}

	return true
})

//======//
// Wire //
//======//
N.Wire = S.Struct({
	id: N.WireId,
	source: N.CellId,
	target: N.CellId,
	colour: N.WireColour,
	timing: N.Timing,
})

//=======//
// Nogan //
//=======//
N.Nogan = S.Struct({
	nextCell: N.CellId.withDefault(1),
	nextWire: N.WireId.withDefault(-1),
	archivedCells: S.ArrayOf(N.CellId),
	archivedWires: S.ArrayOf(N.WireId),
	deletedCells: S.ArrayOf(N.CellId),
	deletedWires: S.ArrayOf(N.WireId),

	items: S.ObjectWith({
		keysOf: N.Id,
		valuesOf: S.Any([N.Cell, N.Wire]).nullable(),
	}).withMake(() => {
		return { [0]: N.Cell.make({ type: "root", id: 0, parent: 0 }) }
	}),
}).andCheck((nogan) => {
	if (!nogan.items[0] || nogan.items[0].type !== "root") {
		throw new Error("Nogan must have a root cell with id 0")
	}

	const connectionTypes = [
		{
			name: "source",
			type: "outputs",
		},
		{
			name: "target",
			type: "inputs",
		},
	]

	for (const itemId in nogan.items) {
		const item = nogan.items[itemId]
		const id = Number(itemId)
		if (item === null) continue
		if (item.id >= 0) {
			if (!N.Cell.check(item)) {
				throw new Error(`Cell ${id} is invalid`)
			}

			const parents = []
			for (let i = 0; i < nogan.nextCell; i++) {
				if (i === id) continue
				const other = nogan.items[i]
				if (other === null) continue
				if (other === undefined) continue
				if (other.id === item.id) {
					throw new Error(`Cell ${id} has same id as cell ${i}`)
				}
				if (other.cells.includes(item.id)) {
					parents.push(i)
				}
			}

			if (item.type !== "root") {
				if (parents.length === 0) {
					throw new Error(`Cell ${id} has no parents`)
				} else if (parents.length > 1) {
					throw new Error(`Cell ${id} has multiple parents: ${parents}`)
				} else if (parents[0] !== item.parent) {
					throw new Error(
						`Cell ${id} has parent ${item.parent} but should have ${parents[0]}`,
					)
				}
			} else {
				if (parents.length > 0) {
					throw new Error(`Root cell has parents`)
				}
				if (item.parent !== 0) {
					throw new Error(`Root cell has parent ${item.parent} but should have 0`)
				}
			}

			for (const childId of item.cells) {
				const child = nogan.items[childId]
				if (child === undefined) {
					throw new Error(`Cell ${id} contains non-existent cell ${childId}`)
				}

				if (child === null) {
					throw new Error(`Cell ${id} contains binned cell ${childId}`)
				}

				if (!N.Cell.check(child)) {
					throw new Error(`Cell ${id} contains invalid cell ${childId}`)
				}
			}

			for (const connections of ["inputs", "outputs"]) {
				for (const connection of item[connections]) {
					const wire = nogan.items[connection]
					if (wire === undefined) {
						throw new Error(`Cell ${id} contains non-existent wire ${connection}`)
					}

					if (wire === null) {
						throw new Error(`Cell ${id} contains binned wire ${connection}`)
					}

					if (!N.Wire.check(wire)) {
						throw new Error(`Cell ${id} contains invalid wire ${connection}`)
					}
				}
			}
		} else if (item.id < 0) {
			if (!N.Wire.check(item)) {
				throw new Error(`Wire ${id} is invalid`)
			}

			if (item.source === 0 || item.target === 0) {
				throw new Error(`Wire ${id} has root as source or target`)
			}

			for (const connectionType of connectionTypes) {
				const { name, type } = connectionType
				const id = item[name]
				const cell = nogan.items[id]
				if (cell === undefined) {
					throw new Error(`Wire ${id} has non-existent ${name} ${id}`)
				}

				if (cell === null) {
					throw new Error(`Wire ${id} has binned ${name} ${id}`)
				}

				if (!N.Cell.check(cell)) {
					throw new Error(`Wire ${id} has invalid ${name} ${id}`)
				}

				if (!cell[type].includes(item.id)) {
					throw new Error(`Wire ${id} is not in ${name} ${id}'s ${type}`)
				}
			}
		}
	}

	const itemTypes = [
		{
			name: "cell",
			deleted: "deletedCells",
			archived: "archivedCells",
			next: "nextCell",
			sign: 1,
		},
		{
			name: "wire",
			deleted: "deletedWires",
			archived: "archivedWires",
			next: "nextWire",
			sign: -1,
		},
	]

	for (const itemType of itemTypes) {
		const { deleted, archived, next, name, sign } = itemType

		const bin = [...nogan[archived], ...nogan[deleted]]

		for (const archivedId of nogan[archived]) {
			if (nogan[deleted].includes(archivedId)) {
				throw new Error(`${name} ${archivedId} is both deleted and archived`)
			}
		}

		const binSet = new Set(bin)
		if (binSet.size !== bin.length) {
			throw new Error(`${name} binned list contains duplicates`)
		}

		for (const id of bin) {
			if (nogan.items[id]) {
				throw new Error(`${name} ${id} is binned but still exists`)
			}

			if (Math.abs(id) > Math.abs(nogan[next])) {
				throw new Error(`${name} ${id} is binned but it was never created to begin with`)
			}
		}

		let reservedCount = 0
		for (let i = sign; i !== nogan[next]; i += sign) {
			const item = nogan.items[i]
			if (item === undefined) {
				throw new Error(`${name} ${i} is reserved but does not exist`)
			}

			if (item === null) {
				if (!bin.includes(i)) {
					reservedCount++
				}
				continue
			}

			if (item.type === "root") {
				throw new Error(`${name} ${i} is a root but is not cell 0`)
			}
		}

		if (reservedCount > 1) {
			throw new Error(
				`There are ${reservedCount} reserved cells - can only reserve 1 at a time`,
			)
		}
	}

	return true
})

//===========//
// Operation //
//===========//
N.Operation = S.Anything //todo

//======//
// Peak //
//======//
N.BasePeak = S.Struct({
	result: S.Boolean,
	operations: S.ArrayOf(N.Operation),
})

N.FailPeak = N.BasePeak.combine({
	result: S.Value(false),
})

N.SuccessPeak = N.BasePeak.combine({
	result: S.Value(true),
	pulse: N.Pulse,
})

N.Peak = S.Any([N.FailPeak, N.SuccessPeak])

// //============//
// // Operations //
// //============//
// /** @type {OperationType[]} */
// export const OPERATION_TYPES = ["modify", "fired"]

// /**
//  * @type {Record<OperationType, OperationType>}
//  */
// export const OPERATION_TYPE = {
// 	modify: "modify",
// 	fired: "fired",
// }

// N.OperateType = S.Enum(OPERATION_TYPES)

// N.BaseOperation = S.Struct({
// 	type: N.String,
// 	data: S.Anything,
// })

// N.ModifyOperation = N.BaseOperation.combine({
// 	type: N.Value("modify"),
// 	data: N.NodTemplate.partial(),
// })

// N.FiredOperation = N.BaseOperation.combine({
// 	type: N.Value("fired"),
// })

// N.Operation = S.Any([N.ModifyOperation, N.FiredOperation])

// //======//
// // Peak //
// //======//

// N.FailPeak = S.Struct({
// 	schemaName: S.Value("FailPeak"),
// 	result: S.Value(false),
// 	operations: S.ArrayOf(N.Operation),
// })

// N.SuccessPeak = S.Struct({
// 	schemaName: S.Value("SuccessPeak"),
// 	result: S.Value(true),
// 	type: N.PulseType,
// 	template: N.NodTemplate,
// 	data: S.Anything, //yolo
// 	operations: S.ArrayOf(N.Operation),
// })

// N.Peak = S.Any([N.FailPeak, N.SuccessPeak])

// N.FullPeak = S.Struct({
// 	schemaName: S.Value("FullPeak"),
// 	result: S.Boolean,
// 	red: N.Peak,
// 	green: N.Peak,
// 	blue: N.Peak,
// })
