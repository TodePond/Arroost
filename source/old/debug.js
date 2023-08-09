import { RED, use } from "../../libraries/habitat-import.js"
import { getPointer } from "../arroost/input/pointer.js"
import { Ellipse } from "../entities/shapes/ellipse.js"
import { shared } from "../main.js"

export const registerDebugs = (reallyThough = true) => {
	if (!reallyThough) return
	const circle = new DebugCircle()
	circle.svg.element.setAttribute("pointer-events", "none")
	circle.svg.element.setAttribute("visibility", "hidden")
	circle.style.fill = "none"

	const { camera } = shared
	camera.add(circle)

	addEventListener("pointerdown", (event) => {
		circle.svg.element.setAttribute("visibility", "visible")
		circle.bringToFront()
	})

	addEventListener("pointerup", (event) => {
		circle.svg.element.setAttribute("visibility", "hidden")
	})

	const pointer = getPointer()
	use(() => {
		if (pointer.position.x === undefined || pointer.position.y === undefined) {
			return
		}
		circle.bringToFront()
		circle.transform.position = [
			pointer.position.x / camera.transform.scale.x,
			pointer.position.y / camera.transform.scale.y,
		]
	})
}

const DebugCircle = class extends Ellipse {
	constructor() {
		super()
		this.style.stroke = RED
		this.style.strokeWidth = 1
		this.style.pointerEvents = "none"
	}
}
