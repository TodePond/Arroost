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
/** @typedef {number} Id */
N.Id = S.SafePositiveInteger.withDefault(null)

/** @typedef {-1} PhantomId */
N.PhantomId = S.Value(-1)

/**
 * @typedef {{
 * 	schemaName: string,
 * 	isChild: boolean,
 * 	id: Id,
 * }} Child
 */
N.Child = N.Struct({
	// Meta
	schemaName: S.Value("Child"),
	isChild: S.True,

	// Family
	id: N.Id,
})

/**
 * @typedef {Child & {
 * 	isParent: boolean,
 * 	nextId: Id,
 * 	freeIds: Id[],
 * 	children: Record<Id, Nogan | null>,
 * }} Parent
 */
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
export const WIRE_COLOURS = ["any", "blue", "green", "red"]

/** @typedef {"any" | "blue" | "green" | "red"} WireColour */
N.WireColour = S.Enum(WIRE_COLOURS)

/** @typedef {-1 | 0 | 1} Timing */
N.Timing = S.Enum([0, -1, 1])

/**
 * @typedef {Child & {
 * 	isWire: boolean,
 * 	colour: WireColour,
 * 	timing: Timing,
 * 	source: Id,
 * 	target: Id,
 * }} Wire
 */
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
export const PULSE_COLOURS = ["blue", "green", "red"]
export const PULSE_TYPES = [
	// done
	"any",
	"creation",

	// in progress

	// todo
	"destruction",
	"recording",
	// ... more!
]

/** @typedef {"blue" | "green" | "red"} PulseColour */
N.PulseColour = S.Enum(PULSE_COLOURS)

/** @typedef {"any" | "creation" | "destruction" | "recording"} PulseType */
N.PulseType = S.Enum(PULSE_TYPES)

/**
 * @typedef {{
 * 	type: PulseType, data: any
 * }} Pulse
 */
N.Pulse = S.Struct({
	type: N.PulseType,
	data: S.Anything, //yolo
})

/**
 * @typedef {Pulse & {type: "any"}} PhantomPulse
 */
N.PhantomPulse = N.Pulse.extend({
	type: N.Value("any"),
})

/**
 * @typedef {{
 * 	red: Pulse | null,
 * 	green: Pulse | null,
 * 	blue: Pulse | null,
 * }} Pulses
 */
N.Pulses = S.Struct({
	red: N.Pulse.nullable(),
	green: N.Pulse.nullable(),
	blue: N.Pulse.nullable(),
})

/**
 * @typedef {{
 * 	red: PhantomPulse,
 * 	green: PhantomPulse,
 * 	blue: PhantomPulse,
 * }} PhantomPulses
 */
N.PhantomPulses = S.Struct({
	red: N.PhantomPulse,
	green: N.PhantomPulse,
	blue: N.PhantomPulse,
})

//=====//
// Nod //
//=====//
export const NOD_TYPES = [
	"any",
	"slot",
	"creation",
	"destruction",
	"recording",
	// ... more!
]

/** @typedef {"any" | "slot" | "creation" | "destruction" | "recording"} NodType */
N.NodType = S.Enum(NOD_TYPES)

/**
 * @typedef {[number, number]} Vector2D
 */

/**
 * @typedef {{
 * 	position: Vector2D,
 * 	type: NodType,
 * }} NodTemplate
 */
N.NodTemplate = N.Struct({
	position: S.Vector2D,
	type: N.NodType,
})

/**
 * @typedef {Parent & {
 * 	isNod: boolean,
 * 	outputs: Id[],
 * 	inputs: Id[],
 * 	pulses: Pulses,
 * 	position: Vector2D,
 * 	type: NodType,
 * }} Nod
 */
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

/**
 * @typedef {Nod & {
 * 	isPhantom: boolean,
 * 	pulses: PhantomPulses,
 * }} Phantom
 */
N.Phantom = N.Nod.extend({
	// Meta
	schemaName: S.Value("Phantom"),
	isPhantom: S.True,

	// Family
	id: N.PhantomId,

	// Pulse
	pulses: N.reference("PhantomPulses"),
})

/**
 * @typedef {Wire | Wire | Phantom} Nogan
 */
N.Nogan = N.Wire.or(N.Nod).or(N.Phantom)

//============//
// Operations //
//============//
/**
 * @typedef {{
 * 	type: string,
 * 	data: any,
 * }} BaseOperation
 */
N.BaseOperation = S.Struct({
	type: N.String,
	data: S.Anything,
})

/**
 * @typedef {BaseOperation & {
 * 	type: "modify",
 * 	data: Partial<NodTemplate>,
 * }} ModifyOperation
 */
N.ModifyOperation = N.BaseOperation.combine({
	type: N.Value("modify"),
	data: N.NodTemplate.partial(),
})

/**
 * @typedef {ModifyOperation} Operation
 */
N.Operation = S.Any([N.ModifyOperation])

//======//
// Peak //
//======//

/**
 * @typedef {{
 * 	schemaName: string,
 * 	result: boolean,
 * 	operations: Operation[],
 * }} PartialPeak
 */
N.FailPeak = S.Struct({
	schemaName: S.Value("FailPeak"),
	result: S.Value(false),
	operations: S.ArrayOf(N.Operation),
})

/**
 * @typedef {{
 * 	schemaName: string,
 * 	result: boolean,
 * 	type: PulseType,
 * 	template: NodTemplate,
 * 	data: any,
 * 	operations: Operation[],
 * }} CompletePeak
 */
N.SuccessPeak = S.Struct({
	schemaName: S.Value("SuccessPeak"),
	result: S.Value(true),
	type: N.PulseType,
	template: N.NodTemplate,
	data: S.Anything, //yolo
	operations: S.ArrayOf(N.Operation),
})

/**
 * @typedef {PartialPeak | CompletePeak} Peak
 */
N.Peak = S.Any([N.FailPeak, N.SuccessPeak])

/**
 * @typedef {{
 * 	schemaName: string,
 * 	result: boolean,
 * 	red: Peak,
 * 	green: Peak,
 * 	blue: Peak,
 * }} FullPeak
 */
N.FullPeak = S.Struct({
	schemaName: S.Value("FullPeak"),
	result: S.Boolean,
	red: N.Peak,
	green: N.Peak,
	blue: N.Peak,
})
