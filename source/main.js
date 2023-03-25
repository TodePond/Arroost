import { print, range, registerMethods, Stage, WHITE } from "../libraries/habitat-import.js"
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
	box.transform.rotation++
}

let prevBox = box
for (const i of range(0, 200)) {
	const _box = new Box()
	_box.rectangle.dimensions = [10, 10]
	_box.transform.position = [prevBox.transform.position.x * 0.99, 0]
	_box.style.fill = WHITE
	prevBox.add(_box)
	prevBox = _box
	_box.tick = () => {
		_box.transform.rotation += 0.01
	}
}

export const shared = {
	pointer,
	stage,
	camera,
}
