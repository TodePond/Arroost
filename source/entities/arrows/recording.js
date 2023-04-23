import {
	GREY,
	RED,
	SILVER,
	WHITE,
	add,
	glue,
	repeatArray,
	scale,
	subtract,
} from "../../../libraries/habitat-import.js"
import { setCursor } from "../../input/cursor.js"
import { shared } from "../../main.js"
import { INNER_RATIO, INNER_UNIT, MAGNET_UNIT } from "../../unit.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Thing } from "../thing.js"
import { ArrowOfNoise } from "./noise.js"

export const ArrowOfRecording = class extends Ellipse {
	recording = this.use(false)
	playing = this.use(false)

	recordingStartTime = this.use(null)

	inner = new Ellipse()
	noiseHolder = new Thing()
	noise = this.use(null, { store: false })

	colour = this.use(
		() => {
			if (this.input.Pointing) return WHITE
			if (this.recording === true) {
				return RED
			}
			return SILVER
		},
		{ store: false },
	)

	constructor() {
		super()
		const { transform, style } = this
		glue(this)
		this.add(this.noiseHolder)
		this.add(this.inner)

		this.inner.transform.scale = repeatArray([INNER_RATIO], 2)
		this.inner.input = this.input
		this.use(() => (this.inner.style.fill = this.colour))

		style.stroke = "none"
		style.fill = GREY
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
		this.noiseHolder.add(this.noise)
		this.noise.sendToBack()
		this.noise.transform.position.x = INNER_UNIT / 3
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
