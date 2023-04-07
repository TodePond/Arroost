import { WHITE, scale, subtract } from "../../../../libraries/habitat-import.js"
import { Ellipse } from "../../shapes/ellipse.js"
import { Line } from "../../shapes/line.js"

export const ArrowTickler = class extends Ellipse {
	tickle = new Line()

	render() {
		const { style, tickle, input } = this
		this.add(tickle)
		tickle.svg.element.setAttribute("pointer-events", "none")

		// Indicator
		tickle.style.stroke = WHITE
		tickle.style.strokeWidth = (0.8 * 10) / 3
		this.use(() =>
			tickle.svg.element.setAttribute("visibility", input.pointed ? "visible" : "hidden"),
		)
		this.use(() => {
			if (!input.pointed) return

			tickle.target.transform.position = scale(
				subtract(pointer.position, this.transform.absolutePosition),
				1 / this.transform.absoluteScale.x,
			)
		})

		tickle.target.transform.position = [0, 0]

		// Bring to front
		tickle.svg.element.style["z-index"] = 1

		return super.render()
	}

	onPoint() {
		this.bringToFront()
	}
}
