import { GREY, SILVER, WHITE } from "../../../../../libraries/habitat-import.js"
import { Pointing } from "../../../input/states.js"
import { HALF_INNER_RATIO, INNER_RATIO } from "../../../unit.js"
import { Ellipse } from "../../shapes/ellipse.js"
import { ArrowTickler } from "./tickler.js"

export const ArrowOfConnection = class extends ArrowTickler {
	render() {
		const element = super.render()
		const { style, rectangle, input } = this
		const { dimensions } = rectangle

		const outer = new Ellipse()
		const inner = new Ellipse()

		style.fill = GREY
		outer.style.stroke = "none"
		inner.style.stroke = "none"

		outer.style.pointerEvents = "none"
		inner.style.pointerEvents = "none"

		this.add(outer)
		this.add(inner)

		outer.bringToFront()
		inner.bringToFront()

		outer.transform.scale = [INNER_RATIO, INNER_RATIO]
		inner.transform.scale = [HALF_INNER_RATIO, HALF_INNER_RATIO]

		this.use(() => {
			const colour = this.isTickling() || this.input.state === Pointing ? WHITE : SILVER
			outer.style.fill = colour
			inner.style.fill = GREY
		})

		this.use(() => {
			const [width, height] = dimensions
			outer.rectangle.dimensions = [width, height]
			inner.rectangle.dimensions = [width, height]
		})
		return element
	}
}
