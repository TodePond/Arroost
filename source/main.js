import { Habitat, Stage, print, registerMethods } from "../libraries/habitat-import.js"
import { getPointer } from "./arroost/input/pointer.js"
import { registerPreventDefaults } from "./arroost/input/prevent.js"
import { Scene } from "./arroost/scene.js"
import { frame } from "./link.js"
import * as Nogan from "./nogan/nogan.js"
// import { createPhantom } from "./nogan/nogan.js"
import { NoganSchema } from "./nogan/schema.js"

//===============//
// Setup Habitat //
//===============//
window.print = print
// @ts-expect-error
window.dir = console.dir.bind(console)
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

// const machine = new Machine()
// const hover = getHover()

// Register inputs
// connectMachine(machine)
// machine.set(Idle)
// registerWheel()
registerPreventDefaults()
// registerDebugs(false)

//=======//
// Tools //
//=======//
// const arrowOfCreation = new ArrowOfCreation()
// camera.add(arrowOfCreation)
// arrowOfCreation.transform.position = [0, 0]

// const dummy = new Dummy()
// camera.add(dummy)
// dummy.transform.position = [100, 100]

// camera.transform.position = [innerWidth / 2, innerHeight / 2]

let arrowOfConnection
let arrowOfDestruction
export const unlockTool = (source, target, angle) => {
	// switch (target) {
	// 	case "connection": {
	// 		if (arrowOfConnection) return
	// 		arrowOfConnection = new ArrowOfConnection()
	// 		camera.add(arrowOfConnection)
	// 		arrowOfConnection.transform.position = source.transform.position
	// 		arrowOfConnection.movement.velocity = rotate([2, 0], angle)
	// 		source.bringToFront()
	// 		return
	// 	}
	// 	case "destruction": {
	// 		if (arrowOfDestruction) return
	// 		arrowOfDestruction = new ArrowOfDestruction()
	// 		camera.add(arrowOfDestruction)
	// 		arrowOfDestruction.transform.position = source.transform.position
	// 		arrowOfDestruction.movement.velocity = rotate([2, 0], angle)
	// 		source.bringToFront()
	// 		return
	// 	}
	// }
}

frame()

//=================//
// Setup Debugging //
//=================//
Object.assign(window, { Nogan, shared, NoganSchema })
Object.assign(window, shared)
Object.assign(window, Habitat)
