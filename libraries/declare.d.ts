interface Array {
	x?: number
	y?: number
	z?: number
	height?: number
	width?: number
	red?: number
	green?: number
	blue?: number
}

interface Window {
	shared: any
}

declare function print(...args: any[]): void

declare type Check = (value: any) => boolean
declare type Make = (value: any) => any
declare type Diagnose = (value: any) => any

declare type BaseSchema = {
	check: Check
	make: Make
	diagnose: Diagnose
	validate(value: any): void
	and(other: Schema): Schema
	or(other: Schema): Schema
	not(): Schema
	withMake(make: Make): Schema
	withCheck(check: Check): Schema
	andCheck(check: Check): Schema
	withDefault(value: any): Schema
	withDiagnose(diagnose: Diagnose): Schema
	nullable(): Schema
}

declare type StructSchema = BaseSchema & {
	struct: Object<string, Schema>
	extend(other: StructSchema): StructSchema
	base(): StructSchema
	partial(): StructSchema
	combine(other: StructSchema): StructSchema
}

declare type Schema = BaseSchema | StructSchema

declare type Signal<T extends any> = {
	value: T
	get(): T
	set(value: T): void
}

declare type Colour = [number, number, number]
declare type Value = Primitive | object
