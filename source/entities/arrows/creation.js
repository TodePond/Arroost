import { GREY, SILVER, WHITE } from "../../../libraries/habitat-import.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Rectangle } from "../shapes/rectangle.js"

export const ArrowOfCreation = class extends Ellipse {
	render() {
		const { style, rectangle, input } = this
		const { dimensions } = rectangle

		const horizontal = new Rectangle()
		const vertical = new Rectangle()

		this.add(horizontal)
		this.add(vertical)

		horizontal.transform.scale = [0.8, 0.8]
		vertical.transform.scale = [0.8, 0.8]

		horizontal.svg.element.setAttribute("pointer-events", "none")
		vertical.svg.element.setAttribute("pointer-events", "none")

		style.fill = GREY

		this.use(() => {
			const colour = input.hovered ? WHITE : SILVER
			horizontal.style.fill = colour
			vertical.style.fill = colour
		})

		this.use(() => {
			const [width, height] = dimensions
			horizontal.rectangle.dimensions = [width, height / 3]
			vertical.rectangle.dimensions = [width / 3, height]

			horizontal.transform.position = [-width / 2, -height / 6]
			vertical.transform.position = [-width / 6, -height / 2]
		})

		return super.render()
	}
}
