import { Schema } from "../../libraries/schema.js"

/** @type any */
export const NoganSchema = class extends Schema {}

const S = Schema
const N = NoganSchema

N.Id = S.SafePositiveInteger
N.BaseItem = S.Struct({ id: N.Id })
N.Wire = N.BaseItem

N.BaseCell = N.BaseItem.extend({ children: N.ArrayOf(N.Id) })
N.Phantom = N.BaseCell
N.Nod = N.BaseCell
N.Cell = S.Any([N.Phantom, N.Nod])
N.Item = S.Any([N.Cell, N.Wire])

N.Nogan = S.Struct({
	next: N.Id,
	deleted: S.ArrayOf(N.Id),
	archived: S.ArrayOf(N.Id),
	cells: S.ObjectWith({ keysOf: N.Id, valuesOf: N.Cell }),
	wires: S.ObjectWith({ keysOf: N.Id, valuesOf: N.Wire }),
})

//======//
// Wire //
//======//
// /** @type {WireColour[]} */
// export const WIRE_COLOURS = ["any", "blue", "green", "red"]

// N.Wire = N.Child.extend({
// 	schemaName: S.Value("Wire"),
// 	isWire: S.True,

// 	colour: S.Enum(WIRE_COLOURS),
// 	timing: S.Enum([0, -1, 1]),
// 	source: N.Id,
// 	target: N.Id,
// })

// //=======//
// // Pulse //
// //=======//
// /** @type {PulseColour[]} */
// export const PULSE_COLOURS = ["blue", "green", "red"]

// /** @type {PulseType[]} */
// export const PULSE_TYPES = ["any", "creation", "destruction"]

// /**
//  * @type {Record<PulseType, PulseType>}
//  */
// // @ts-expect-error
// export const PULSE_TYPE = PULSE_TYPES.reduce((acc, type) => {
// 	acc[type] = type
// 	return acc
// }, {})

// N.Pulse = S.Struct({
// 	type: N.PulseType,
// 	data: S.Anything, //yolo
// })

// N.PhantomPulse = N.Pulse.extend({
// 	type: N.Value("any"),
// })

// N.Pulses = S.Struct({
// 	red: N.Pulse.nullable(),
// 	green: N.Pulse.nullable(),
// 	blue: N.Pulse.nullable(),
// })

// N.PhantomPulses = S.Struct({
// 	red: N.PhantomPulse,
// 	green: N.PhantomPulse,
// 	blue: N.PhantomPulse,
// })

// //=====//
// // Nod //
// //=====//
// /** @type {NodType[]} */
// export const NOD_TYPES = ["any", "slot", "creation", "destruction", "recording"]

// N.NodType = S.Enum(NOD_TYPES)
// N.NodTemplate = N.Struct({
// 	position: S.Vector2D,
// 	type: N.NodType,
// })

// N.Nod = N.Child.extend({
// 	schemaName: S.Value("Nod"),
// 	isNod: S.True,

// 	outputs: S.ArrayOf(N.Id),
// 	inputs: S.ArrayOf(N.Id),
// 	pulses: N.Pulses,

// 	position: S.Vector2D,
// 	type: N.NodType,
// })

// N.Phantom = N.Nod.extend({
// 	schemaName: S.Value("Phantom"),
// 	isPhantom: S.True,

// 	id: N.PhantomId,

// 	pulses: N.reference("PhantomPulses"),
// })

// N.Cell = N.Wire.or(N.Nod).or(N.Phantom)

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
