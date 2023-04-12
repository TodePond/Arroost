import { RED, WHITE } from "../../../libraries/habitat-import.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Triangle } from "../shapes/triangle.js"

export const ArrowOfRecording = class extends Triangle {
	dot = new Ellipse([1, 1])

	constructor(...args) {
		super(...args)
		this.add(this.dot)
	}

	render() {
		const { transform, style } = this
		transform.rotation = -90
		style.stroke = "none"
		style.fill = WHITE
		return super.render()
	}

	tick() {
		this.transform.rotation++
		this.dot.style.fill = RED
		this.dot.style.stroke = "none"
	}
}
