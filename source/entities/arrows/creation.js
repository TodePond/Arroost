import { GREY, SILVER, WHITE, scale, subtract } from "../../../libraries/habitat-import.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Line } from "../shapes/line.js"
import { Rectangle } from "../shapes/rectangle.js"

export const ArrowOfCreation = class extends Ellipse {
	horizontal = new Rectangle()
	vertical = new Rectangle()
	indicator = new Line()

	render() {
		const { style, rectangle, horizontal, vertical, indicator, input } = this
		const { dimensions } = rectangle

		this.add(horizontal)
		this.add(vertical)
		this.add(indicator)

		horizontal.transform.scale = [0.8, 0.8]
		vertical.transform.scale = [0.8, 0.8]

		horizontal.svg.element.setAttribute("pointer-events", "none")
		vertical.svg.element.setAttribute("pointer-events", "none")
		indicator.svg.element.setAttribute("pointer-events", "none")

		// Colour
		style.fill = GREY
		this.use(() => {
			const colour = input.pointed ? WHITE : SILVER
			horizontal.style.fill = colour
			vertical.style.fill = colour
		})

		// Size
		this.use(() => {
			const [width, height] = dimensions
			horizontal.rectangle.dimensions = [width, height / 3]
			vertical.rectangle.dimensions = [width / 3, height]
		})

		// Indicator
		indicator.style.stroke = WHITE
		indicator.style.strokeWidth = (0.8 * 10) / 3
		this.use(() =>
			indicator.svg.element.setAttribute("visibility", input.pointed ? "visible" : "hidden"),
		)
		this.use(() => {
			if (!input.pointed) return

			indicator.target.transform.position = scale(
				subtract(pointer.position, this.transform.absolutePosition),
				1 / this.transform.absoluteScale.x,
			)
		})

		indicator.target.transform.position = [0, 0]

		// Bring to front
		this.indicator.svg.element.style["z-index"] = 1

		return super.render()
	}

	onPoint() {
		this.bringToFront()
	}
}
