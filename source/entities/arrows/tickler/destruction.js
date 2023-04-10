import { GREY, SILVER, WHITE } from "../../../../../libraries/habitat-import.js"
import { Dragging } from "../../../input/states.js"
import { Rectangle } from "../../shapes/rectangle.js"
import { ArrowTickler } from "./tickler.js"

export const ArrowOfDestruction = class extends ArrowTickler {
	render() {
		const { transform, style, rectangle, input } = this
		const { dimensions } = rectangle

		const horizontal = new Rectangle()
		const vertical = new Rectangle()

		this.add(horizontal)
		this.add(vertical)

		style.fill = GREY

		horizontal.transform.scale = [0.8, 0.8]
		vertical.transform.scale = [0.8, 0.8]
		horizontal.transform.rotation = 45
		vertical.transform.rotation = 45

		horizontal.svg.element.setAttribute("pointer-events", "none")
		vertical.svg.element.setAttribute("pointer-events", "none")

		this.use(() => {
			const colour = input.state === Dragging ? WHITE : SILVER
			horizontal.style.fill = colour
			vertical.style.fill = colour
		})

		this.use(() => {
			const [width, height] = dimensions
			horizontal.rectangle.dimensions = [width, height / 3]
			vertical.rectangle.dimensions = [width / 3, height]
		})

		return super.render()
	}
}
