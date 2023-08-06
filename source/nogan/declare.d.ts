//======//
// Enum //
//======//
declare type CellType = Cell["type"]
declare type PulseType = Pulse["type"]
declare type PulseColour = "blue" | "green" | "red"
declare type WireColour = "any" | "blue" | "green" | "red"
declare type Timing = 0 | -1 | 1
declare type OperationType = Operation["type"]

//=========//
// Utility //
//=========//
declare type Vector2D = [number, number]

//====//
// Id //
//====//
declare type CellId = number
declare type WireId = number

//======//
// Cell //
//======//
declare type CellTemplate = RootCell | DummyCell | CustomCell
declare type Cell = BaseCell & CellTemplate
declare type BaseCell = {
	id: CellId
	parent: CellId
	position: Vector2D
	cells: CellId[]
	inputs: WireId[]
	outputs: WireId[]
	fire: Fire
	tag: { [key: string]: Seralisable }
}

declare type RootCell = { type: "root" }
declare type DummyCell = { type: "dummy" }

//======//
// Wire //
//======//
declare type Wire = {
	id: WireId
	colour: WireColour
	timing: Timing
	source: CellId
	target: CellId
}

//=======//
// Nogan //
//=======//
declare type Nogan = {
	json: string | null
	nextCell: CellId
	nextWire: WireId
	archivedCells: CellId[]
	archivedWires: WireId[]
	deletedCells: CellId[]
	deletedWires: WireId[]
	items: { [id: number]: Cell | Wire | null }
}

//======//
// Peak //
//======//
declare type FailPeak = {
	result: false
	operations: Operation[]
	pulse: null
	final: boolean
}

declare type SuccessPeak = {
	result: true
	operations: Operation[]
	pulse: Pulse
	final: boolean
}

declare type Peak = FailPeak | SuccessPeak

declare type Behave<T extends Pulse> = ({
	source,
	target,
	previous,
	next,
}: {
	source: Cell
	target: Cell
	previous: Peak
	next: SuccessPeak & { pulse: T }
}) => Peak

declare type BehaviourMap = {
	[key in PulseType]: Behave<Extract<Pulse, { type: key }>>
}

//===========//
// Operation //
//===========//
declare type Operation = FiredOperation | CustomOperation
declare type Operate<T extends Operation> = (nogan: Nogan, operation: T) => Operation[]
declare type OperationMap = {
	[key in OperationType]: Operate<Extract<Operation, { type: key }>>
}

declare type FiredOperation = {
	type: "fired"
	id: CellId
}

//======//
// Fire //
//======//
declare type Fire = {
	red: Pulse | null
	green: Pulse | null
	blue: Pulse | null
}

//=======//
// Pulse //
//=======//
declare type Pulse = RawPulse | CustomPulse
declare type RawPulse = { type: "raw" }

//=======//
// Cache //
//=======//
declare class Memo<Value, Key, Args> {
	static RESERVED: unique symbol
	static NEW: unique symbol

	entries: Map<string, Value | typeof Memo.RESERVED>

	encode(args: Args): Key
	query(key: Key): Value | typeof Memo.RESERVED
	store(key: Key, value: Value): void
}

//======//
// Type //
//======//
declare type Primitive = string | number | boolean | null | undefined
declare type Seralisable = Primitive | [...Serialisable] | Record<string, Serialisable>
declare function asConst<
	V extends Primitive,
	T extends V | Record<string, T> | [...V],
	R extends T,
>(v: R): R {
	return v
}

declare type AsConst = typeof asConst

//------- Custom types below this line -------//

//=============//
// Custom Cell //
//=============//
declare type StopperCell = { type: "stopper" }
declare type SlotCell = { type: "slot" }
declare type RecordingCell = { type: "recording" }
declare type CreationCell = { type: "creation" }
declare type DestructionCell = { type: "destruction" }
declare type MagnetCell = todo
declare type TimingCell = todo
type CustomCell = SlotCell | CreationCell | DestructionCell | RecordingCell | StopperCell

//==============//
// Custom Pulse //
//==============//
declare type PingPulse = { type: "ping" }
declare type CreationPulse = { type: "creation"; template: CellTemplate | null }
declare type DestructionPulse = { type: "destruction" }
type CustomPulse = CreationPulse | DestructionPulse | PingPulse

//==================//
// Custom Operation //
//==================//
declare type PongOperation = { type: "pong" }
declare type ModifyOperation = {
	type: "modify"
	id: CellId
	template: Partial<CellTemplate>
}

declare type TagOperation = {
	type: "tag"
	id: CellId
	key: string
	value?: Serialisable
}

type CustomOperation = ModifyOperation | PongOperation | TagOperation
