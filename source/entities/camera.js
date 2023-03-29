import { scale } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"
import { Thing } from "./thing.js"

export const PAN_FRICTION = 0.9

export const Camera = class extends Thing {
	constructor(stage) {
		super()
		this.stage.connect(stage)
	}

	start({ background, html, svg, foreground }) {
		svg.append(this.svg.element)
		foreground.canvas.style["pointer-events"] = "none"
	}

	tick() {
		const { pointer } = shared
		pointer.tick()

		const { movement } = this
		const { velocity } = movement
		movement.update()
		movement.velocity = scale(velocity, PAN_FRICTION)
	}
}
