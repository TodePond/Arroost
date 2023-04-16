import {
	CORAL,
	GREY,
	RED,
	SILVER,
	WHITE,
	add,
	glue,
	scale,
	subtract,
} from "../../../libraries/habitat-import.js"
import { setCursor } from "../../input/cursor.js"
import { Pointing } from "../../input/states.js"
import { shared } from "../../main.js"
import { Triangle } from "../shapes/triangle.js"

export const ArrowOfRecording = class extends Triangle {
	inner = new Triangle()
	recording = this.use(false)
	noise = this.use(null, { store: false })

	colour = this.use(
		() => {
			if (this.recording === true) {
				if (this.input.state === Pointing) {
					return CORAL
				}
				return RED
			}
			if (this.input.state === Pointing) return WHITE
			return SILVER
		},
		{ store: false },
	)

	constructor() {
		super()
		const { transform, style, inner } = this
		glue(this)
		this.add(inner)

		transform.rotation = -90
		style.stroke = "none"
		style.fill = GREY

		inner.transform.scale = [0.6, 0.6]
		inner.style.stroke = "none"
		this.use(() => (inner.style.fill = this.colour))
		inner.svg.element.style["pointer-events"] = "none"
	}

	getColour() {
		if (this.input.state === Pointing) return WHITE
		if (this.input.state === Dragging) return WHITE
		return SILVER
	}

	onPointingEnter() {
		this.bringToFront()
	}

	onPointingPointerMove(event, state) {
		const { pointerStartPosition, inputStartPosition } = state
		const displacement = subtract(shared.pointer.position, pointerStartPosition)
		const distance = Math.hypot(displacement.x, displacement.y)
		if (distance < 10) {
			return null
		}
	}

	onPointingPointerUp() {
		if (!this.recording) {
			this.onRecordStart()
		} else {
			this.onRecordStop()
		}
	}

	onDraggingEnter(previous, state) {
		state.pointerStart = [...shared.pointer.position]
		state.start = [...this.transform.absolutePosition]
		this.movement.velocity = [0, 0]
		setCursor("move")
	}

	onDraggingPointerMove(event, state) {
		const { pointerStartPosition, inputStartPosition } = state
		const displacement = subtract(shared.pointer.position, pointerStartPosition)
		this.transform.setAbsolutePosition(add(inputStartPosition, displacement))
	}

	onDraggingPointerUp() {
		this.movement.setAbsoluteVelocity(shared.pointer.velocity)
	}

	tick() {
		const { movement } = this
		const { velocity } = movement
		movement.update()
		movement.velocity = scale(velocity, 0.9)
	}

	onRecordStart() {
		this.recording = true
	}

	onRecordStop() {
		this.recording = false
	}
}
