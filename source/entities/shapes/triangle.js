import { UNIT } from "../../unit.js"
import { Polygon } from "./polygon.js"

export const Triangle = class extends Polygon {
	constructor(width = UNIT, height = Math.sqrt(3 / 4) * width) {
		super([
			[0, 0],
			[UNIT, 0],
			[0, UNIT],
		])

		this.rectangle.dimensions = [width, height]

		const { rectangle } = this
		const { dimensions } = rectangle
		const [a, b, c] = this.targets
		this.use(() => {
			const [width, height] = dimensions
			const diff = width - height
			a.transform.position = [-width / 2, height / 2 - diff]
			b.transform.position = [width / 2, height / 2 - diff]
			c.transform.position = [0, -height / 2 - diff]
		})
	}
}
