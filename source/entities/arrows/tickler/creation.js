import { GREY, SILVER, WHITE } from "../../../../libraries/habitat-import.js"
import { Dragging } from "../../../input/states.js"
import { Rectangle } from "../../shapes/rectangle.js"
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

		horizontal.svg.element.setAttribute("pointer-events", "none")
		vertical.svg.element.setAttribute("pointer-events", "none")

		// Colour
		style.fill = GREY
		this.use(() => {
			const colour = input.state === Dragging ? WHITE : SILVER
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
}
