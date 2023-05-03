import { Schema } from "../helpers/schema.js"

export const NoganSchema = {}
const S = Schema
const N = NoganSchema

N.Id = S.PositiveInteger
N.NoganType = S.Enum(["nogan", "nod", "wire"])

N.Nogan = S.Struct({
	type: N.NoganType,
	parent: N.Id,
	id: N.Id,
	items: S.ObjectWith({
		keysOf: N.Id,
		valuesOf: S.Object,
	}),
	nextId: N.Id,
	freeIds: S.ArrayOf(N.Id),
	isFiring: S.Boolean,
})
