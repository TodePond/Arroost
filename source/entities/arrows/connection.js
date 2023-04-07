import { GREY, SILVER, WHITE } from "../../../libraries/habitat-import.js"
import { Ellipse } from "../shapes/ellipse.js"

export const ArrowOfConnection = class extends Ellipse {
	render() {
		const { style, rectangle, input } = this
		const { dimensions } = rectangle

		const outer = new Ellipse()
		const inner = new Ellipse()

		style.fill = GREY

		outer.svg.element.setAttribute("pointer-events", "none")
		inner.svg.element.setAttribute("pointer-events", "none")

		this.add(inner)
		this.add(outer)

		outer.transform.scale = [0.8, 0.8]
		inner.transform.scale = [0.4, 0.4]

		this.use(() => {
			const colour = input.hovered ? WHITE : SILVER
			outer.style.fill = colour
			inner.style.fill = GREY
		})

		this.use(() => {
			const [width, height] = dimensions
			outer.rectangle.dimensions = [width, height]
			inner.rectangle.dimensions = [width, height]
		})

		return super.render()
	}
}
