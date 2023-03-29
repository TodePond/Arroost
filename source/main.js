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

const things = [new Box()]
camera.add(things[0])
things[0].transform.position = [100, 100]
things[0].transform.scale = [10, 10]
things[0].tick = () => {
	things[0].transform.rotation += 0.1
}

export const shared = {
	pointer,
	stage,
	camera,
	things,
}

addEventListener("keydown", (e) => {
	if (e.key !== " ") return
	things[0].dispose()
})

Object.assign(window, shared)
