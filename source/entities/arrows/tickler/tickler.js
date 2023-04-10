import { WHITE, scale, subtract } from "../../../../libraries/habitat-import.js"
import { State } from "../../../input/state.js"
import { Dragging } from "../../../input/states.js"
import { shared } from "../../../main.js"
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
		const { tickle, flaps, input } = this
		this.add(tickle)
		this.add(flaps)

		tickle.svg.element.setAttribute("pointer-events", "none")
		flaps.svg.element.setAttribute("pointer-events", "none")

		// Indicator
		tickle.style.stroke = WHITE
		tickle.style.strokeWidth = (0.8 * 10) / 3
		flaps.style.stroke = WHITE
		flaps.style.fill = "none"
		flaps.style.strokeWidth = (0.8 * 10) / 3
		this.use(() => {
			const visibility = this.isTickling() ? "visible" : "hidden"
			tickle.svg.element.setAttribute("visibility", visibility)
			flaps.svg.element.setAttribute("visibility", visibility)
		})

		this.use(() => {
			if (!this.isTickling()) return

			const position = scale(
				subtract(pointer.position, this.transform.absolutePosition),
				1 / this.transform.absoluteScale.x,
			)

			const scaling = 1
			const angle = Math.atan2(position.y, position.x) * (180 / Math.PI) - 45

			tickle.target.transform.position = position
			flaps.transform.position = position
			flaps.transform.rotation = angle
			flaps.transform.scale = [scaling, scaling]
		})

		tickle.target.transform.position = [0, 0]

		return super.render()
	}

	isTickling() {
		return this.input.state === Tickling || this.input.state === Dragging
	}

	onPointingPointerMove() {
		if (shared.hover.entity === this) return null
		return Tickling
	}

	onDraggingEnter() {
		this.bringToFront()
	}

	onPointingPointerUp() {
		return Tickling
	}

	onTicklingEnter() {
		this.bringToFront()
	}
}

export const Tickling = new State({
	name: "Tickling",
	cursor: "none",

	onPointerDown() {
		return Dragging
	},
})
