import {
	BLACK,
	SILVER,
	WHITE,
	angleBetween,
	subtract,
} from "../../../../../libraries/habitat-import.js"
import { shared, unlockTool } from "../../../../main.js"
import { createNod, modifyNod, validateFamily } from "../../../../nogan/nogan.js"
import { Dragging, Idle, Pointing } from "../../../input/states.js"
import { INNER_RATIO } from "../../../unit.js"
import { Rectangle } from "../../shapes/rectangle.js"
import { ArrowOfRecording } from "../recording.js"
import { ArrowTickler } from "./tickler.js"

let createdCount = 0

export const ArrowOfCreation = class extends ArrowTickler {
	horizontal = new Rectangle()
	vertical = new Rectangle()

	/**
	 *
	 * @param {Parent} layer
	 * @param {Nod?} nod
	 */
	constructor(layer = shared.nogan.current, nod = createNod(layer, { type: "creation" })) {
		super()

		validateFamily(layer, nod)

		this.nod = nod
		this.layer = layer
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

		// Colour
		this.use(() => {
			let colour
			if (this.isPulsing) {
				colour = BLACK
			} else {
				colour = this.isTickling() || this.input.state === Pointing ? WHITE : SILVER
			}
			horizontal.style.fill = colour
			vertical.style.fill = colour
		})

		// Size
		this.use(() => {
			const [width, height] = dimensions
			console.log("foo")
			horizontal.rectangle.dimensions = [width, height / 3]
			vertical.rectangle.dimensions = [width / 3, height]
		})

		// Position
		this.use(() => {
			const [x, y] = transform.absolutePosition
			modifyNod(this.layer, { id: this.nod.id, position: [x, y] })
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
			unlockTool(this, "connection", angle)
		}
		if (createdCount >= 3) {
			const reverseDirection = subtract(
				this.transform.absolutePosition,
				shared.pointer.position,
			)
			const angle = angleBetween(reverseDirection, [1, 0])
			unlockTool(this, "destruction", angle)
		}
		const recording = new ArrowOfRecording()
		shared.camera.add(recording)
		recording.transform.setAbsolutePosition(shared.pointer.position)
		recording.movement.setAbsoluteVelocity(shared.pointer.velocity)
		state.input.state = Idle
		state.input = recording.input
		state.entity = recording

		return Dragging
	}
}
