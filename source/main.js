import {
	Machine,
	print,
	registerMethods,
	repeatArray,
	Stage,
} from "../libraries/habitat-import.js"
import { ArrowOfCreation } from "./entities/arrows/creation.js"
import { Camera } from "./entities/camera.js"
import { getHover } from "./input/hover.js"
import { connectMachine } from "./input/machine.js"
import { getPointer } from "./input/pointer.js"
import { preventDefaults } from "./input/prevent.js"
import { Idle } from "./input/state.js"

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
preventDefaults()
machine.set(Idle)

//===============//
// Setup Arroost //
//===============//
const arrowOfCreation = new ArrowOfCreation()
arrowOfCreation.transform.position = [
	innerWidth / 2 / camera.transform.scale.x,
	innerHeight / 2 / camera.transform.scale.y,
]

camera.add(arrowOfCreation)

//=================//
// Setup Debugging //
//=================//
Object.assign(window, shared)
