import { Schema } from "../../helpers/schema.js"

export const NoganSchema = class extends Schema {}
const S = Schema
const N = NoganSchema

N.Id = S.SafePositiveInteger

N.Parent = S.Struct({
	isParent: S.True,
	nextId: N.Id,
	freeIds: S.ArrayOf(N.Id),
	children: S.ObjectWith({
		keysOf: N.Id,
		valuesOf: N.reference("Child"),
	}),
	isFiringRed: S.Boolean,
	isFiringGreen: S.Boolean,
	isFiringBlue: S.Boolean,
})

N.Phantom = N.Parent.extend({
	isPhantom: S.True,
	isFiringRed: S.True,
	isFiringGreen: S.True,
	isFiringBlue: S.True,
})

N.Child = N.Parent.extend({
	isChild: S.True,
	id: N.Id.withDefault(null),
	position: S.Vector2D,
	outputs: S.ArrayOf(N.reference("Wire")),
	inputs: S.ArrayOf(N.reference("Wire")),
})

N.Colour = S.Enum(["blue", "green", "red"])
N.Timing = S.Enum(["same", "before", "after"])
N.Wire = N.Child.extend({
	isWire: S.True,
	colour: N.Colour,
	timing: N.Timing,
	targetLocation: S.Vector2D,
	input: N.Child.nullable(),
	output: N.Child.nullable(),
})

N.NodType = S.Enum(["nod", "creation"])
N.Targetting = S.Enum(["none", "point", "vector"])

N.Nod = N.Child.extend({
	isNod: S.True,
	type: N.NodType,
	pointTargetting: N.Targetting,
	unitTargetting: N.Targetting,
})

N.Creation = N.Nod.extend({
	isCreation: S.True,
	type: N.NodType.and(S.Value("creation")),
	pointTargetting: N.Targetting.and(S.Value("point")),
	unitTargetting: N.Targetting.and(S.Value("vector")),
})
