import { print, registerMethods, Stage } from "../libraries/habitat-import.js"
import { Box } from "./entities/box.js"
import { Camera } from "./entities/camera.js"
import { getPointer } from "./input/pointer.js"

window.print = print
window.dir = console.dir.bind(console)

registerMethods()

const pointer = getPointer()
const stage = new Stage({
	context: { background: "2d", html: "html", svg: "svg", foreground: "2d" },
})

const camera = new Camera(stage)

const box = new Box()
box.rectangle.dimensions = [100, 100]
box.transform.position = [-50, -50]

camera.add(box)
camera.tick = () => {
	camera.transform.position = pointer.position
}

export const shared = {
	pointer,
	stage,
	camera,
	//world,
}
