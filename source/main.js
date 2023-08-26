import {
	BLACK,
	Habitat,
	Machine,
	Splash,
	Stage,
	VOID,
	print,
	registerMethods,
	Colour,
} from "../libraries/habitat-import.js"
import { getPointer } from "./arroost/input/pointer.js"
import { registerPreventDefaults } from "./arroost/input/prevent.js"
import { Scene } from "./arroost/entities/scene.js"
import { frame } from "./link.js"
import * as Nogan from "./nogan/nogan.js"
import { NoganSchema } from "./nogan/schema.js"
import { registerWheel } from "./arroost/input/wheel.js"
import { registerMachine } from "./arroost/input/machine.js"
import { HoverMachine } from "./arroost/input/machines/hover.js"
import { InputMachine } from "./arroost/input/machines/input.js"
import { getZoomer } from "./arroost/input/zoomer.js"

//===============//
// Setup Habitat //
//===============//
window["print"] = print
window["dir"] = console.dir.bind(console)
registerMethods()

export const GREY_SILVER = new Colour(83, 101, 147)

//==============//
// Setup Engine //
//==============//
export const shared = {
	time: performance.now(),
	nogan: Nogan.createNogan(),
	level: Nogan.getRoot(Nogan.createNogan()).id,
	debug: { validate: true },
	zoomer: getZoomer(),
	/** @type {Scene} */
	// @ts-expect-error
	scene: undefined,
	clock: {
		time: 0,
		lastBeatTime: 0,
		beatCount: 0,
		bpm: 120,
	},
}
document.body.style["background-color"] = BLACK
const stage = new Stage({ context: { html: "html" } })
shared.stage = stage

const scene = new Scene()
shared.scene = scene
stage.start = scene.start.bind(scene)
stage.tick = scene.tick.bind(scene)

const pointer = getPointer()
shared.pointer = pointer

// The hover machine just keeps track of the currently hovered element
const hover = new Machine(new HoverMachine())
shared.hovering = hover.state.get()

// The input machine handles the core interaction for entities
// ie: hovering, pointing, dragging
const input = new Machine(new InputMachine())

registerWheel()
registerMachine(hover)
registerMachine(input)
registerPreventDefaults()

frame()

//=========================//
// Setup Console Debugging //
//=========================//
Object.assign(window, { Nogan, shared, NoganSchema })
Object.assign(window, shared)
Object.assign(window, Habitat)
