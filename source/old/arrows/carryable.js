import { subtract } from "../../../libraries/habitat-import.js"
import { MAGNET_UNIT } from "../../arroost/unit.js"
import { shared } from "../../main.js"
import { Ellipse } from "../shapes/ellipse.js"

export const Carryable = class extends Ellipse {
	carryCursor = "move"

	constructor(components = []) {
		super([100, 100], components)
	}

	onPointingEnter(previous, state) {
		this.bringToFront()
	}

	onPointingPointerMove(event, state) {
		const displacement = subtract(shared.pointer.position, state.pointerStart)
		const distance = Math.hypot(displacement.x, displacement.y)
		if (distance < MAGNET_UNIT) {
			return null
		}
	}

	onDraggingEnter(previous, state) {
		this.movement.velocity = [0, 0]
	}

	onDraggingPointerMove(event, state) {
		this.transform.setAbsolutePosition(shared.pointer.absolutePosition)
	}

	onDraggingPointerUp() {
		// this.movement.setAbsoluteVelocity(shared.pointer.velocity)
	}

	tick() {
		const { movement } = this
		movement.update()
		movement.applyFriction()
	}
}
