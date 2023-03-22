import { print, registerMethods, Stage } from "../libraries/habitat-import.js"
import { Camera } from "./entities/camera.js"
import { World } from "./entities/world.js"
import { getPointer } from "./input/pointer.js"

window.print = print
window.dir = console.dir.bind(console)

registerMethods()

const pointer = getPointer()
const stage = new Stage({
	context: { background: "2d", html: "html", svg: "svg", foreground: "2d" },
})
const camera = new Camera(stage)
const world = new World()

camera.add(world)

export const shared = {
	pointer,
	stage,
	camera,
	world,
}
