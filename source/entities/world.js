import { repeatArray } from "../../libraries/habitat-import.js"
import { Box } from "./box.js"

export const World = class extends Box {
	constructor() {
		super()
		this.rectangle.dimensions = [16, 12]
		this.transform.scale = repeatArray([50], 2)
		this.transform.position = [
			innerWidth / 2 - this.rectangle.absoluteDimensions.x / 2,
			innerHeight / 2 - this.rectangle.absoluteDimensions.y / 2,
		]
	}
}
