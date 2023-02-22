import { WHITE } from "../../libraries/habitat-import.js"

export const Entity = class {
	position = [0, 0]
	dimensions = [10, 10]

	draw([context]) {
		context.fillStyle = WHITE
		context.fillRect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.height)
	}
}
