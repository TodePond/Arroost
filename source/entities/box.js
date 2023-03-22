import { Component, Entity, SVG, use } from "../../libraries/habitat-import.js"
import { Movement } from "../components/movement.js"
import { Style } from "../components/style.js"

export const Box = class extends Entity {
	constructor(dimensions = [10, 10]) {
		super([
			new Component.Transform(),
			new Component.Rectangle(dimensions),
			new Component.Stage(),
			new Movement(),
			new Style(),
		])
	}

	start({ svg }) {
		const rect = SVG(`<rect />`)

		use(() => rect.setAttribute("fill", this.style.fill))
		use(() => rect.setAttribute("x", this.transform.position.x))
		use(() => rect.setAttribute("y", this.transform.position.y))
		use(() => rect.setAttribute("width", this.rectangle.scaledDimensions.width))
		use(() => rect.setAttribute("height", this.rectangle.scaledDimensions.height))

		svg.append(rect)
	}
}
