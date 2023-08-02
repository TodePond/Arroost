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
declare type CellTemplate = { type: CellType; position: Vector2D }
declare type Cell = BaseCell & (RootCell | DummyCell | CustomCell)
declare type BaseCell = {
	id: CellId
	parent: CellId
	position: Vector2D
	cells: CellId[]
	inputs: WireId[]
	outputs: WireId[]
	fire: Fire
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
declare type BasePeak = {
	result: boolean
	operations: Operation[]
}

declare type FailPeak = {
	result: false
	operations: Operation[]
}

declare type SuccessPeak = {
	result: true
	operations: Operation[]
	pulse: Pulse
}

declare type Peak = FailPeak | SuccessPeak
declare type Behaviour = ({ previous, next }: { previous: Peak; next: Peak }) => Peak

//===========//
// Operation //
//===========//
declare type Operation = FiredOperation | CustomOperation
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

//------- Custom types below this line -------//

//=============//
// Custom Cell //
//=============//
declare type SlotCell = { type: "slot" }
declare type RecordingCell = { type: "recording" }
declare type CreationCell = { type: "creation" }
declare type DestructionCell = { type: "destruction" }
type CustomCell = SlotCell | CreationCell | DestructionCell | RecordingCell

//==============//
// Custom Pulse //
//==============//
declare type CreationPulse = { type: "creation"; template: CellTemplate }
declare type DestructionPulse = { type: "destruction" }
type CustomPulse = CreationPulse | DestructionPulse

//==================//
// Custom Operation //
//==================//
declare type ModifyOperation = {
	type: "modify"
	id: CellId
	template: Partial<CellTemplate>
}

type CustomOperation = ModifyOperation
