import { Schema } from "../../libraries/schema.js"

/** @type any */
export const NoganSchema = class extends Schema {}

const S = Schema
const N = NoganSchema

N.Never = S.BaseStruct({
	schemaName: S.Value("Never"),
})
	.withCheck(() => false)
	.withDiagnose((value) => {
		const { schemaName, ...values } = value
		return values
	})

//========//
// Family //
//========//
N.Id = S.SafePositiveInteger.withDefault(null)
N.PhantomId = S.Value(-1)

N.Child = N.Struct({
	// Meta
	schemaName: S.Value("Child"),
	isChild: S.True,

	// Family
	id: N.Id,
})

N.Parent = N.Child.extend({
	// Meta
	schemaName: S.Value("Parent"),
	isParent: S.True,

	// Family
	nextId: N.Id.withDefault(0),
	freeIds: S.ArrayOf(N.Id),
	children: S.ObjectWith({
		keysOf: N.Id,
		valuesOf: N.reference("Nogan").nullable(),
	}),
})

//========//
// Wiring //
//========//
/** @type {WireColour[]} */
export const WIRE_COLOURS = ["any", "blue", "green", "red"]

N.WireColour = S.Enum(WIRE_COLOURS)

N.Timing = S.Enum([0, -1, 1])

N.Wire = N.Child.extend({
	// Meta
	schemaName: S.Value("Wire"),
	isWire: S.True,

	// Wiring
	colour: N.WireColour,
	timing: N.Timing,
	source: N.Id,
	target: N.Id,
})

//=======//
// Pulse //
//=======//
/** @type {PulseColour[]} */
export const PULSE_COLOURS = ["blue", "green", "red"]

/** @type {PulseType[]} */
export const PULSE_TYPES = [
	// done
	"any",
	"creation",

	// in progress

	// todo
	"destruction",
	// ... more!
]

N.PulseColour = S.Enum(PULSE_COLOURS)
N.PulseType = S.Enum(PULSE_TYPES)

N.Pulse = S.Struct({
	type: N.PulseType,
	data: S.Anything, //yolo
})

N.PhantomPulse = N.Pulse.extend({
	type: N.Value("any"),
})

N.Pulses = S.Struct({
	red: N.Pulse.nullable(),
	green: N.Pulse.nullable(),
	blue: N.Pulse.nullable(),
})

N.PhantomPulses = S.Struct({
	red: N.PhantomPulse,
	green: N.PhantomPulse,
	blue: N.PhantomPulse,
})

//=====//
// Nod //
//=====//
/** @type {NodType[]} */
export const NOD_TYPES = [
	"any",
	"slot",
	"creation",
	"destruction",
	"recording",
	// ... more!
]

N.NodType = S.Enum(NOD_TYPES)
N.NodTemplate = N.Struct({
	position: S.Vector2D,
	type: N.NodType,
})

N.Nod = N.Parent.extend({
	// Meta
	schemaName: S.Value("Nod"),
	isNod: S.True,

	// Wiring
	outputs: S.ArrayOf(N.Id),
	inputs: S.ArrayOf(N.Id),

	// Pulse
	pulses: N.reference("Pulses"),

	// Template
	position: S.Vector2D,
	type: N.NodType,
})

N.Phantom = N.Nod.extend({
	// Meta
	schemaName: S.Value("Phantom"),
	isPhantom: S.True,

	// Family
	id: N.PhantomId,

	// Pulse
	pulses: N.reference("PhantomPulses"),
})

N.Nogan = N.Wire.or(N.Nod).or(N.Phantom)

//============//
// Operations //
//============//
N.BaseOperation = S.Struct({
	type: N.String,
	data: S.Anything,
})

N.ModifyOperation = N.BaseOperation.combine({
	type: N.Value("modify"),
	data: N.NodTemplate.partial(),
})

N.Operation = S.Any([N.ModifyOperation])

//======//
// Peak //
//======//

N.FailPeak = S.Struct({
	schemaName: S.Value("FailPeak"),
	result: S.Value(false),
	operations: S.ArrayOf(N.Operation),
})

N.SuccessPeak = S.Struct({
	schemaName: S.Value("SuccessPeak"),
	result: S.Value(true),
	type: N.PulseType,
	template: N.NodTemplate,
	data: S.Anything, //yolo
	operations: S.ArrayOf(N.Operation),
})

N.Peak = S.Any([N.FailPeak, N.SuccessPeak])

N.FullPeak = S.Struct({
	schemaName: S.Value("FullPeak"),
	result: S.Boolean,
	red: N.Peak,
	green: N.Peak,
	blue: N.Peak,
})
