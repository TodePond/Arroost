import { Polygon } from "./polygon.js"

export const Triangle = class extends Polygon {
	constructor(width = 10, height = width) {
		super([
			[0, 0],
			[10, 0],
			[0, 10],
		])

		this.rectangle.dimensions = [width, height]

		const { rectangle } = this
		const { dimensions } = rectangle
		const [a, b, c] = this.targets
		this.use(() => {
			const [width, height] = dimensions
			a.transform.position = [-width / 2, height / 2]
			b.transform.position = [width / 2, height / 2]
			c.transform.position = [0, -height / 2]
		})
	}
}
