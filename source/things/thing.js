import { HTML, VOID, WHITE } from "../../libraries/habitat-import.js"

export const Thing = class {
	position = [0, 0]
	dimensions = [10, 10]
	colour = WHITE
	started = false

	constructor(options = {}) {
		Object.assign(this, options)
	}

	start([context, html]) {
		this.started = true
		const message = HTML(`<div style="color: ${VOID}">Thing</div>`)
		html.appendChild(message)
	}

	draw([context]) {
		context.fillStyle = this.colour
		context.fillRect(this.position.x, this.position.y, this.dimensions.width, this.dimensions.height)
	}
}
