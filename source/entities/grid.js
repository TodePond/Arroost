import { Component, Entity, glue, SVG, use } from "../../libraries/habitat-import.js"
import { Movement } from "../components/movement.js"
import { Style } from "../components/style.js"

export const Grid = class extends Entity {
	gridDimensions = use([10, 10])
	cellDimensions = use([20, 20])

	constructor(gridDimensions = [10, 10]) {
		super([
			new Component.Transform(),
			new Component.Rectangle(),
			new Component.Stage(),
			new Movement(),
			new Style(),
		])

		glue(this)
		this.gridDimensions = gridDimensions

		use(() => {
			this.rectangle.dimensions = [
				this.cellDimensions.x * this.gridDimensions.x,
				this.cellDimensions.y * this.gridDimensions.y,
			]
		})
	}

	start({ svg }) {
		const group = SVG(`<g />`)

		const definitions = SVG(`<defs />`)
		const pattern = SVG(`<pattern id="grid" patternUnits="userSpaceOnUse" />`)
		use(() => pattern.setAttribute("width", this.cellDimensions.x))
		use(() => pattern.setAttribute("height", this.cellDimensions.y))

		const rectangle = SVG(`<rect />`)
		use(() => rectangle.setAttribute("width", this.cellDimensions.x - 1))
		use(() => rectangle.setAttribute("height", this.cellDimensions.y - 1))
		use(() => rectangle.setAttribute("fill", this.style.fill))

		const container = SVG(`<rect fill="url(#grid)" />`)
		use(() =>
			container.setAttribute(
				"transform",
				`translate(${this.transform.position.x}, ${this.transform.position.y}) scale(${this.transform.scale.x}, ${this.transform.scale.y})`,
			),
		)
		use(() => container.setAttribute("width", this.rectangle.dimensions.width))
		use(() => container.setAttribute("height", this.rectangle.dimensions.height))

		group.append(definitions)
		group.append(container)

		definitions.append(pattern)
		pattern.append(rectangle)

		svg.append(group)
	}
}
