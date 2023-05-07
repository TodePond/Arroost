import { Schema } from "../../helpers/schema.js"

export const NoganSchema = class extends Schema {}
const S = Schema
const N = NoganSchema

//========//
// Family //
//========//
N.Id = S.SafePositiveInteger
N.Parent = S.Struct({
	isParent: S.True,
	nextId: N.Id,
	freeIds: S.ArrayOf(N.Id),
	children: S.ObjectWith({
		keysOf: N.Id,
		valuesOf: N.reference("Child"),
	}),
	pulse: N.reference("Pulse"),
})

N.Phantom = N.Parent.extend({
	isPhantom: S.True,
	pulse: N.reference("Pulse"), //TODO: phantom pulses only
})

N.Child = N.Parent.extend({
	isChild: S.True,
	id: N.Id.withDefault(null),
	position: S.Vector2D,
	outputs: S.ArrayOf(N.reference("Wire")),
	inputs: S.ArrayOf(N.reference("Wire")),
})

//=======//
// Wires //
//=======//
N.Colour = S.Enum(["blue", "green", "red"])
N.PulseType = S.Enum(["recording", "creation"])

const pulseStruct = {}
for (const type of N.PulseType.values) {
	const pulseTypeStruct = {}
	for (const colour of N.Colour.values) {
		pulseTypeStruct[colour] = S.Boolean
	}
	pulseStruct[type] = S.Struct(pulseTypeStruct)
}

N.Pulse = S.Struct(pulseStruct)

N.Timing = S.Enum(["same", "before", "after"])
N.Wire = N.Child.extend({
	isWire: S.True,
	colour: N.Colour,
	timing: N.Timing,
	targetPosition: S.Vector2D,
	connectedInput: N.Id.nullable(),
	connectedOutput: N.Id.nullable(),
})

//======//
// Nods //
//======//
N.NodType = S.Enum(["recording", "creation"])
N.Nod = N.Child.extend({
	isNod: S.True,
	type: N.NodType.withDefault(null), // Default to null so that we force an error if we forget to set it
	pointTargetting: N.Targetting,
	unitTargetting: N.Targetting,
})
