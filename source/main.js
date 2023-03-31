import {
	Machine,
	print,
	registerMethods,
	repeatArray,
	Stage,
} from "../libraries/habitat-import.js"
import { ArrowOfArrow } from "./entities/arrows/arrow.js"
import { ArrowOfCreation } from "./entities/arrows/creation.js"
import { ArrowOfDestruction } from "./entities/arrows/destruction.js"
import { Camera } from "./entities/camera.js"
import { getHover } from "./input/hover.js"
import { connectMachine } from "./input/machine.js"
import { getPointer } from "./input/pointer.js"
import { registerPreventDefaults } from "./input/prevent.js"
import { registerSlide } from "./input/slide.js"
import { Idle } from "./input/states/idle.js"

//===============//
// Setup Habitat //
//===============//
window.print = print
window.dir = console.dir.bind(console)
registerMethods()

//==============//
// Setup Engine //
//==============//
const stage = new Stage({
	context: { background: "2d", html: "html", svg: "svg", foreground: "2d" },
})

const camera = new Camera(stage)
camera.transform.scale = repeatArray([5], 2)

const pointer = getPointer()
const hover = getHover()
const machine = new Machine()

export const shared = {
	pointer,
	stage,
	camera,
	machine,
	hover,
}

connectMachine(machine)
registerSlide()
registerPreventDefaults()
machine.set(Idle)

//===============//
// Setup Arroost //
//===============//
const arrowOfCreation = new ArrowOfCreation()
camera.add(arrowOfCreation)
arrowOfCreation.transform.position = [
	((innerWidth / camera.transform.scale.x) * 2) / 3,
	innerHeight / 2 / camera.transform.scale.y,
]

const arrowOfDestruction = new ArrowOfDestruction()
camera.add(arrowOfDestruction)
arrowOfDestruction.transform.position = [
	((innerWidth / camera.transform.scale.x) * 1) / 3,
	innerHeight / 2 / camera.transform.scale.y,
]

const arrowOfArrow = new ArrowOfArrow()
camera.add(arrowOfArrow)
arrowOfArrow.transform.position = [
	innerWidth / 2 / camera.transform.scale.x,
	innerHeight / 2 / camera.transform.scale.y,
]

//=================//
// Setup Debugging //
//=================//
Object.assign(window, shared)
