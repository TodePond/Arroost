import {
	BLACK,
	SILVER,
	WHITE,
	angleBetween,
	subtract,
} from "../../../../../libraries/habitat-import.js"
import { shared, unlockTool } from "../../../../main.js"
import { addFullPulse, createNod, validateFamily } from "../../../../nogan/nogan.js"
import { Dragging, Idle, Pointing } from "../../../input/states.js"
import { INNER_RATIO } from "../../../unit.js"
import { Rectangle } from "../../shapes/rectangle.js"
import { ArrowOfRecording } from "../recording.js"
import { ArrowTickler } from "./tickler.js"

let createdCount = 0

export const ArrowOfCreation = class extends ArrowTickler {
	horizontal = new Rectangle()
	vertical = new Rectangle()

	constructor(mummy = shared.nogan.current, nod) {
		super()
		if (nod === undefined) {
			nod = createNod(mummy)
		}

		validateFamily(mummy, nod)

		this.nod = nod
		this.mummy = mummy
	}

	render() {
		const { style, rectangle, horizontal, vertical } = this
		const { dimensions } = rectangle

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
			horizontal.rectangle.dimensions = [width, height / 3]
			vertical.rectangle.dimensions = [width / 3, height]
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

		addFullPulse(this.mummy, { target: this.nod.id })
		this.isPulsing = true

		return Dragging
	}
}
