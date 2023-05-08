import { Schema } from "../../../libraries/schema.js"

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
		valuesOf: N.reference("Nogan"),
	}),
})

//========//
// Wiring //
//========//
N.Colour = S.Enum(["all", "blue", "green", "red"])
N.Timing = S.Enum(["same", "before", "after"])
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

N.Pulse = S.Struct(pulseStruct)
N.PhantomPulse = S.Struct(phantomPulseStruct)

//=====//
// Nod //
//=====//
N.Nod = N.Parent.extend({
	// Meta
	schemaName: S.Value("Nod"),
	isNod: S.True,

	// Wiring
	outputs: S.ArrayOf(N.reference("Wire")),
	inputs: S.ArrayOf(N.reference("Wire")),

	// Pulse
	pulse: N.reference("Pulse"),

	// Nod
	position: S.Vector2D,
	type: N.PulseType,
	colour: N.Colour,
})

N.Phantom = N.Nod.extend({
	// Meta
	schemaName: S.Value("Phantom"),
	isPhantom: S.True,

	// Family
	id: S.Value(-1),

	// Pulse
	pulse: N.reference("PhantomPulse"),
})

N.Nogan = N.Wire.or(N.Nod).or(N.Phantom)
