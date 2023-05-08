import { Schema } from "../../helpers/schema.js"

export const NoganSchema = class extends Schema {}
const S = Schema
const N = NoganSchema

//========//
// Family //
//========//
N.Id = S.SafePositiveInteger.withDefault(null)
N.Child = N.Struct({
	// Meta
	schemaName: S.Value("Child"),
	isChild: S.True,

	// Family
	id: N.Id.withDefault(null),
})

N.Parent = N.Child.extend({
	// Meta
	schemaName: S.Value("Parent"),
	isParent: S.True,

	// Family
	nextId: N.Id.withDefault(0),
	freeIds: S.ArrayOf(N.Id),

	// Firing
	children: S.ObjectWith({
		keysOf: N.Id,
		valuesOf: N.reference("Nod"),
	}),
})

//=======//
// Wires //
//=======//
N.Colour = S.Enum(["all", "blue", "green", "red"])
N.PulseType = S.Enum(["any", "creation"])

const pulseStruct = {}
const phantomPulseStruct = {}
for (const type of N.PulseType.values) {
	const pulseTypeStruct = {}
	const phantomPulseTypeStruct = {}
	for (const colour of N.Colour.values) {
		pulseTypeStruct[colour] = S.Boolean
		phantomPulseTypeStruct[colour] = type === "any" ? S.True : S.False
	}
	pulseStruct[type] = S.Struct(pulseTypeStruct)
	phantomPulseStruct[type] = S.Struct(phantomPulseTypeStruct)
}

N.Pulse = S.Struct({
	schemaName: S.Value("Pulse"),
	...pulseStruct,
})
N.PhantomPulse = S.Struct({
	schemaName: S.Value("PhantomPulse"),
	...phantomPulseStruct,
})

N.Timing = S.Enum(["same", "before", "after"])
N.Wire = N.Child.extend({
	// Meta
	schemaName: S.Value("Wire"),
	isWire: S.True,

	// Connection
	colour: N.Colour,
	timing: N.Timing,
	source: N.Id,
	target: N.Id,
})

//======//
// Nods //
//======//
N.Nod = N.Parent.extend({
	// Meta
	schemaName: S.Value("Nod"),
	isNod: S.True,

	// Pulse
	pulse: N.reference("Pulse"),

	// Pulse Modifiers
	type: N.PulseType,
	colour: N.Colour,

	// Connection
	position: S.Vector2D,
	outputs: S.ArrayOf(N.reference("Wire")),
	inputs: S.ArrayOf(N.reference("Wire")),
})

N.Phantom = N.Nod.extend({
	// Meta
	schemaName: S.Value("Phantom"),
	isPhantom: S.True,

	// Family
	id: S.Value(-1),

	// Firing
	pulse: N.reference("PhantomPulse"),
})
