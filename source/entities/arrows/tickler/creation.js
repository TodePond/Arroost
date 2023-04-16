import { GREY, SILVER, WHITE } from "../../../../libraries/habitat-import.js"
import { Pointing } from "../../../input/states.js"
import { shared } from "../../../main.js"
import { Rectangle } from "../../shapes/rectangle.js"
import { ArrowOfRecording } from "../recording.js"
import { ArrowTickler } from "./tickler.js"

export const ArrowOfCreation = class extends ArrowTickler {
	horizontal = new Rectangle()
	vertical = new Rectangle()

	render() {
		const { style, rectangle, horizontal, vertical, input } = this
		const { dimensions } = rectangle

		this.add(horizontal)
		this.add(vertical)

		horizontal.transform.scale = [0.8, 0.8]
		vertical.transform.scale = [0.8, 0.8]

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

	onTickle() {
		const recording = new ArrowOfRecording()
		shared.camera.add(recording)
		recording.transform.setAbsolutePosition(shared.pointer.position)
		recording.movement.setAbsoluteVelocity(shared.pointer.velocity)
	}
}
