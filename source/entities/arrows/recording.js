import { GREY, SILVER } from "../../../libraries/habitat-import.js"
import { Triangle } from "../shapes/triangle.js"

export const ArrowOfRecording = class extends Triangle {
	inner = new Triangle()

	constructor() {
		super()
		const { transform, style, inner } = this
		this.add(inner)

		transform.rotation = -90
		style.stroke = "none"
		style.fill = GREY

		inner.transform.scale = [0.6, 0.6]
		inner.style.stroke = "none"
		inner.style.fill = SILVER
	}
}
