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
import { shared } from "../../main.js"
import {
	INNER_RATIO,
	MAGNET_UNIT,
	TRIANGLE_OFFSET,
	TRIANGLE_RATIO,
	TRIANGLE_UNIT,
} from "../../unit.js"
import { Triangle } from "../shapes/triangle.js"
import { ArrowOfNoise } from "./noise.js"

export const ArrowOfRecording = class extends Triangle {
	inner = new Triangle()

	recording = this.use(false)
	playing = this.use(false)

	recordingStartTime = this.use(null)

	noise = this.use(null, { store: false })

	colour = this.use(
		() => {
			if (this.recording === true) {
				if (this.input.Pointing) {
					return CORAL
				}
				return RED
			}
			if (this.input.Pointing) return WHITE
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

		inner.transform.scale = [INNER_RATIO * TRIANGLE_RATIO.d, INNER_RATIO * TRIANGLE_RATIO]
		inner.style.stroke = "none"
		this.use(() => (inner.style.fill = this.colour))
		inner.svg.element.style["pointer-events"] = "none"
	}

	getColour() {
		if (this.input.Pointing) return WHITE
		if (this.input.Dragging) return WHITE
		return SILVER
	}

	onPointingEnter() {
		this.bringToFront()
	}

	onPointingPointerMove(event, state) {
		const { pointerStartPosition } = state
		const displacement = subtract(shared.pointer.position, pointerStartPosition)
		const distance = Math.hypot(displacement.x, displacement.y)
		if (distance < MAGNET_UNIT) {
			return null
		}
	}

	onPointingPointerUp() {
		if (this.noise === null) {
			this.onRecordStart()
		} else if (this.recording) {
			this.onRecordStop()
		} else if (this.playing) {
			this.onPlayStop()
		} else {
			this.onPlayStart()
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

		if (this.recording) {
			this.noise.duration = shared.time - this.recordingStartTime
		}
	}

	onRecordStart() {
		this.recording = true
		this.noise = new ArrowOfNoise()
		this.add(this.noise)
		this.noise.transform.position.y = TRIANGLE_UNIT / 2 - TRIANGLE_OFFSET
		this.recordingStartTime = shared.time
	}

	onRecordStop() {
		this.recording = false
	}

	onPlayStart() {
		this.playing = true
	}

	onPlayStop() {
		this.playing = false
	}
}
