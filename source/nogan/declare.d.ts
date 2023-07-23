//======//
// Wire //
//======//
declare type Id = number
declare type BaseItem = { id: Id }
declare type Wire = BaseItem

//======//
// Cell //
//======//
declare type BaseCell = BaseItem & { children: Id[] }
declare type Phantom = BaseCell
declare type Nod = BaseCell
declare type Cell = Phantom | Nod
declare type Item = Wire | Cell

//=======//
// Nogan //
//=======//
declare type Nogan = {
	next: Id
	deleted: Id[]
	archived: Id[]
	cells: Object<Id, Cell>
	wires: Object<Id, Wire>
}

//=========//
// Phantom //
//=========//
// declare type WireColour = "any" | "blue" | "green" | "red"

// declare type Wire = BaseCell & {
// 	isWire: true
// 	isNod: false
// 	colour: WireColour
// 	timing: 0 | -1 | 1
// 	source: Id
// 	target: Id
// }

// declare type PulseColour = "blue" | "green" | "red"
// declare type PulseType = "any" | "creation" | "destruction"

// declare type Pulse = {
// 	type: PulseType
// 	colour: PulseColour
// }

// declare type PhantomPulse = Pulse & {
// 	type: "any"
// }

// declare type Pulses = {
// 	red: Pulse | null
// 	green: Pulse | null
// 	blue: Pulse | null
// }

// declare type PhantomPulses = Pulses & {
// 	red: PhantomPulse
// 	green: PhantomPulse
// 	blue: PhantomPulse
// }

// declare type NodType = "any" | "slot" | "creation" | "destruction" | "recording"

// declare type Vector2D = [number, number]

// declare type NodTemplate = {
// 	position: Vector2D
// 	type: NodType
// }

// declare type Nod = BaseChild & {
// 	isNod: true
// 	isWire: false
// 	outputs: Id[]
// 	inputs: Id[]
// 	pulses: Pulses
// 	position: Vector2D
// 	type: NodType
// }

// declare type Phantom = Nod & {
// 	isPhantom: true
// 	id: PhantomId
// 	pulses: PhantomPulses
// }

// declare type Nogan = Nod | Wire | Phantom
// declare type Parent = Nod | Phantom
// declare type Child = Nod | Wire

// declare type Operation = {
// 	type: OperationType
// 	data: any
// }

// declare type BasePeak = {
// 	schemaName: string
// 	result: boolean
// 	operations: Operation[]
// }

// declare type FailPeak = BasePeak & {
// 	schemaName: "FailPeak"
// 	result: false
// }

// declare type SuccessPeak = {
// 	schemaName: "SuccessPeak"
// 	result: true
// 	operations: Operation[]
// 	type: PulseType
// 	template: NodTemplate
// 	data: any
// }

// declare type Peak = FailPeak | SuccessPeak

// declare type FullPeak = {
// 	schemaName: "FullPeak"
// 	result: boolean
// 	red: Peak
// 	green: Peak
// 	blue: Peak
// }

// declare type Behave = (parent: Parent, { peak, id }: { peak: SuccessPeak; id: Id }) => Peak

// declare type OperationType = "modify" | "fired"
// declare type Operate = (parent: Parent, { id, data }: { id: Id; data: any }) => void
