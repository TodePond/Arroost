import { Schema } from "../../libraries/schema.js"

export const NoganSchema = class extends Schema {}
const S = Schema
const N = NoganSchema

N.Never = S.PartialStruct({
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
export const PULSE_COLOURS = ["blue", "green", "red"]

N.Colour = S.Enum(PULSE_COLOURS)
N.Timing = S.Enum([0, -1, 1])
N.Wire = N.Child.extend({
	// Meta
	schemaName: S.Value("Wire"),
	isWire: S.True,

	// Wiring
	colour: N.Colour,
	timing: N.Timing,
	source: N.Id,
	target: N.Id,
})

//=======//
// Pulse //
//=======//

// The pulse type refers to where the pulse is coming from.
export const SOURCE_TYPES = ["any", "creation", "destruction"]

N.SourceType = S.Enum(SOURCE_TYPES)

N.Pulse = S.Struct({
	type: N.SourceType,
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
N.NodTemplate = N.Struct({
	schemaName: S.Value("NodTemplate"),
	position: S.Vector2D,
	type: N.SourceType,
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
	type: N.SourceType,
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

//======//
// Peak //
//======//
N.Peak = S.Struct({
	schemaName: S.Value("Peak"),
	result: S.Boolean,
	type: N.SourceType,
	template: N.NodTemplate,
})

N.FullPeak = S.Struct({
	schemaName: S.Value("FullPeak"),
	result: S.Boolean,
	red: N.Peak,
	green: N.Peak,
	blue: N.Peak,
})

//============//
// Operations //
//============//
N.BaseOperation = S.Struct({
	schemaName: S.Value("BaseOperation"),
	type: N.String,
	data: S.Any,
})

N.ReplaceOperation = N.BaseOperation.extend({
	schemaName: S.Value("ReplaceOperation"),
	type: N.Value("replace"),
	data: N.NodTemplate.partial(),
})

N.Operation = N.ReplaceOperation

//===========//
// Behaviour //
//===========//
N.Behaviour = S.Struct({
	schemaName: S.Value("Behaviour"),
	peak: N.Peak,
	operations: S.ArrayOf(N.Operation),
})
