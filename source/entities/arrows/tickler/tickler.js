import { WHITE, subtract } from "../../../../libraries/habitat-import.js"
import { setCursor } from "../../../input/cursor.js"
import { State } from "../../../input/state.js"
import { Dragging } from "../../../input/states.js"
import { shared } from "../../../main.js"
import { INNER_ATOM_UNIT } from "../../../unit.js"
import { Ellipse } from "../../shapes/ellipse.js"
import { Line } from "../../shapes/line.js"
import { Polyline } from "../../shapes/polyline.js"

export const ArrowTickler = class extends Ellipse {
	tickle = new Line()
	flaps = new Polyline([
		[-6, 0],
		[0, 0],
		[0, -6],
	])

	render() {
		const { pointer } = shared
		const { tickle, flaps } = this
		this.add(tickle)
		this.add(flaps)

		this.style.stroke = "none"

		tickle.style.pointerEvents = "none"
		flaps.style.pointerEvents = "none"

		// Indicator
		tickle.style.stroke = WHITE
		tickle.style.strokeWidth = INNER_ATOM_UNIT
		flaps.style.stroke = WHITE
		flaps.style.fill = "none"
		flaps.style.strokeWidth = INNER_ATOM_UNIT
		this.use(() => {
			const visibility = this.isTickling() ? "visible" : "hidden"
			tickle.style.visibility = visibility
			flaps.style.visibility = visibility
		})

		this.use(() => {
			if (!this.isTickling()) return

			const displacement = subtract(pointer.position, this.transform.absolutePosition)
			const angle = Math.atan2(displacement.y, displacement.x) * (180 / Math.PI) - 45
			flaps.transform.rotation = angle

			tickle.target.transform.setAbsolutePosition(pointer.position)
			flaps.transform.setAbsolutePosition(pointer.position)
		})

		tickle.target.transform.position = [0, 0]

		return super.render()
	}

	isTickling() {
		return this.input.state === Tickling || this.input.state === Dragging
	}

	onPointingPointerMove() {
		if (shared.hover.entity === this) return null
		return Dragging
	}

	onPointingPointerUp() {
		return Tickling
	}

	onDraggingEnter() {
		this.bringToFront()
		setCursor("none")
	}

	onDraggingPointerUp() {
		this.onTickle()
	}

	onTicklingEnter() {
		this.bringToFront()
	}

	onTicklingPointerDown() {
		return Dragging
	}

	onTickle() {
		// Override this
	}
}

export const Tickling = new State({
	name: "Tickling",
	cursor: "none",
})
