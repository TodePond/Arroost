import { GREY, SILVER, WHITE } from "../../../../libraries/habitat-import.js"
import { Pointing } from "../../../input/states.js"
import { shared, unlockTool } from "../../../main.js"
import { NoganSchema } from "../../../nogan/source/schema.js"
import { INNER_RATIO } from "../../../unit.js"
import { Rectangle } from "../../shapes/rectangle.js"
import { ArrowOfRecording } from "../recording.js"
import { ArrowTickler } from "./tickler.js"

let createdCount = 0

export const ArrowOfCreation = class extends ArrowTickler {
	nogan = NoganSchema.Creation.make()

	horizontal = new Rectangle()
	vertical = new Rectangle()

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
		style.fill = GREY
		this.use(() => {
			const colour = this.isTickling() || this.input.state === Pointing ? WHITE : SILVER
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
		if (createdCount < 2) {
			unlockTool(this)
		}
		createdCount++
		const recording = new ArrowOfRecording()
		shared.camera.add(recording)
		recording.transform.setAbsolutePosition(shared.pointer.position)
		recording.movement.setAbsoluteVelocity(shared.pointer.velocity)
	}
}
