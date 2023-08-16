import { Habitat, Machine, Stage, print, registerMethods } from "../libraries/habitat-import.js"
import { getPointer } from "./arroost/input/pointer.js"
import { registerPreventDefaults } from "./arroost/input/prevent.js"
import { Scene } from "./arroost/entities/scene.js"
import { frame } from "./link.js"
import * as Nogan from "./nogan/nogan.js"
// import { createPhantom } from "./nogan/nogan.js"
import { NoganSchema } from "./nogan/schema.js"
import { registerWheel } from "./arroost/input/wheel.js"
import { registerMachine } from "./arroost/input/machine.js"
import { getHoverState } from "./arroost/input/machines/hover.js"

//===============//
// Setup Habitat //
//===============//
window["print"] = print
window["dir"] = console.dir.bind(console)
registerMethods()

//==============//
// Setup Engine //
//==============//
export const shared = {
	time: performance.now(),
	nogan: Nogan.createNogan(),
	level: Nogan.getRoot(Nogan.createNogan()).id,
	debug: { validate: true },
}

const stage = new Stage({ context: { html: "html" } })
shared.stage = stage

const scene = new Scene()
shared.scene = scene
stage.start = scene.start.bind(scene)
stage.tick = scene.tick.bind(scene)
shared.pointer = getPointer()

registerWheel()
registerPreventDefaults()
registerMachine(new Machine(getHoverState()))

frame()

//=========================//
// Setup Console Debugging //
//=========================//
Object.assign(window, { Nogan, shared, NoganSchema })
Object.assign(window, shared)
Object.assign(window, Habitat)
