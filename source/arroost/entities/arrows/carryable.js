import { add, subtract } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { setCursor } from "../../input/cursor.js"
import { MAGNET_UNIT } from "../../unit.js"
import { Ellipse } from "../shapes/ellipse.js"

export const Carryable = class extends Ellipse {
	carryCursor = "move"

	onPointingEnter() {
		this.bringToFront()
	}

	onPointingPointerMove(event, state) {
		const { pointerStartDisplacedPosition } = state
		const displacement = subtract(
			shared.pointer.displacedPosition,
			pointerStartDisplacedPosition,
		)
		const distance = Math.hypot(displacement.x, displacement.y)
		if (distance < MAGNET_UNIT) {
			return null
		}
	}

	onDraggingEnter(previous, state) {
		state.pointerStart = [...shared.pointer.position]
		state.start = [...this.transform.absolutePosition]
		this.movement.velocity = [0, 0]
		setCursor(this.carryCursor)
	}

	onDraggingPointerMove(event, state) {
		const { pointerStartPosition, inputStartPosition } = state
		const displacement = subtract(shared.pointer.position, pointerStartPosition)
		this.transform.setAbsolutePosition(add(inputStartPosition, displacement))
		this.transform.absolutePosition
	}

	onDraggingPointerUp() {
		this.movement.setAbsoluteVelocity(shared.pointer.velocity)
	}

	tick() {
		const { movement } = this
		movement.update()
		movement.applyFriction()
	}
}
