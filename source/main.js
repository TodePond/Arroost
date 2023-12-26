import {
	BLACK,
	Habitat,
	Machine,
	Stage,
	print,
	registerMethods,
	Colour,
	getKeyboard,
} from "../libraries/habitat-import.js"
import { getPointer } from "./arroost/input/pointer.js"
import { registerPreventDefaults } from "./arroost/input/prevent.js"
import { Scene } from "./arroost/entities/scene.js"
import * as Nogan from "./nogan/nogan.js"
import { NoganSchema } from "./nogan/schema.js"
import { registerWheel } from "./arroost/input/wheel.js"
import { registerMachine } from "./arroost/machines/machine.js"
import { HoverMachine } from "./arroost/machines/hover.js"
import { InputMachine } from "./arroost/machines/input.js"
import { getZoomer } from "./arroost/input/zoomer.js"
import { clock } from "./clock.js"

//======//
// Tone //
//======//
export const MIDDLE_C = Tone.Frequency("C4").toFrequency()

//===============//
// Setup Habitat //
//===============//
window["print"] = print
window["dir"] = console.dir.bind(console)
registerMethods()

export const GREY_SILVER = new Colour(83, 101, 147)
export const GREY_BLACK = new Colour(31, 39, 54)

//==============//
// Setup Engine //
//==============//
export const shared = {
	time: performance.now(),
	nogan: Nogan.createNogan(),
	level: Nogan.getRoot(Nogan.createNogan()).id,
	debug: { validate: true },
	zoomer: getZoomer(),
	keyboard: getKeyboard(),
	/** @type {Scene} */
	// @ts-expect-error
	scene: undefined,
	clock,

	/** @type {Pointer} */
	// @ts-expect-error
	pointer: undefined,
}

document.body.style["background-color"] = BLACK
document.body.style["-webkit-tap-highlight-color"] = "transparent"
const stage = new Stage({ context: { html: "html" } })
shared.stage = stage

const scene = new Scene()
shared.scene = scene
stage.start = scene.start.bind(scene)
stage.tick = scene.tick.bind(scene)
stage.resize = scene.resize.bind(scene)

const pointer = getPointer()
shared.pointer = pointer

// The hover machine just keeps track of the currently hovered element
const hover = new Machine(new HoverMachine())
shared.hovering = hover.state.get()

// The input machine handles the core interaction for entities
// ie: hovering, pointing, dragging
const input = new Machine(new InputMachine())
shared.input = input

registerWheel()
registerMachine(hover)
registerMachine(input)
registerPreventDefaults()

addEventListener(
	"click",
	() => {
		Tone.start()
	},
	{ once: true },
)

//=========================//
// Setup Console Debugging //
//=========================//
Object.assign(window, { Nogan, shared, NoganSchema })
Object.assign(window, shared)
Object.assign(window, Habitat)
window["Habitat"] = Habitat

//================//
// START THE LOOP //
//================//
clock.start()
