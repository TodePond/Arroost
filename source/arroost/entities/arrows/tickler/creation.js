import { angleBetween, subtract } from "../../../../../libraries/habitat-import.js"
import { shared } from "../../../../main.js"
import { fireCell, modifyCell } from "../../../../nogan/nogan.js"
// import { createNod, modifyNod, validateFamily } from "../../../../nogan/nogan.js"
import { Dragging } from "../../../input/states.js"
import { INNER_RATIO } from "../../../unit.js"
import { Rectangle } from "../../shapes/rectangle.js"
import { ArrowTickler } from "./tickler.js"

let createdCount = 0

export const ArrowOfCreation = class extends ArrowTickler {
	horizontal = new Rectangle()
	vertical = new Rectangle()

	constructor(options = {}) {
		super({ type: "creation", ...options })
	}

	render() {
		const { style, rectangle, horizontal, vertical, transform } = this
		const { dimensions } = rectangle
		const { absolutePosition } = transform

		this.add(horizontal)
		this.add(vertical)

		horizontal.transform.scale = [INNER_RATIO, INNER_RATIO]
		vertical.transform.scale = [INNER_RATIO, INNER_RATIO]

		horizontal.style.pointerEvents = "none"
		vertical.style.pointerEvents = "none"

		this.use(() => {
			horizontal.style.fill = this.cell.foreground.value
			vertical.style.fill = this.cell.foreground.value
		})

		// Size
		this.use(() => {
			const [width, height] = dimensions
			horizontal.rectangle.dimensions = [width, height / 3]
			vertical.rectangle.dimensions = [width / 3, height]
		})

		// Position
		this.use(() => {
			const [x, y] = transform.absolutePosition
			modifyCell(shared.nogan, { id: this.cell.id, position: [x, y] })
		})

		return super.render()
	}

	onTickle(event, state) {
		createdCount++
		if (createdCount >= 2) {
			const reverseDirection = subtract(
				this.transform.absolutePosition,
				shared.pointer.position,
			)
			const angle = angleBetween(reverseDirection, [1, 0])
			// unlockTool(this, "connection", angle)
		}

		if (createdCount >= 3) {
			const reverseDirection = subtract(
				this.transform.absolutePosition,
				shared.pointer.position,
			)
			const angle = angleBetween(reverseDirection, [1, 0])
			// unlockTool(this, "destruction", angle)
		}

		// Create a Recording
		// const recording = new ArrowOfRecording()
		// shared.camera.add(recording)
		// recording.transform.setAbsolutePosition(shared.pointer.position)
		// recording.movement.setAbsoluteVelocity(shared.pointer.velocity)
		// state.input.state = Idle
		// state.input = recording.input
		// state.entity = recording

		// Fire this cell!
		fireCell(shared.nogan, { id: this.cell.id })

		return Dragging
	}
}
