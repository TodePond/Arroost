import { shared } from "../main.js"
import { Grid } from "./grid.js"

export const World = class extends Grid {
	constructor() {
		super([16, 12])
		this.transform.position = [
			innerWidth / 2 - this.rectangle.absoluteDimensions.x / 2,
			innerHeight / 2 - this.rectangle.absoluteDimensions.y / 2,
		]
		this.transform.scale = [5, 5]
	}

	update() {
		const { pointer } = shared
		this.transform.position = pointer.position
	}
}
