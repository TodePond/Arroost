import { SVG } from "../../../../libraries/habitat-import.js"
import { UNIT } from "../../unit.js"
import { Thing } from "../thing.js"

export const Rectangle = class extends Thing {
	constructor(dimensions = [UNIT, UNIT]) {
		super()
		this.rectangle.dimensions = dimensions
	}

	render() {
		const rectangle = SVG("rect")

		const { style } = this
		const { dimensions } = this.rectangle

		this.use(() => rectangle.setAttribute("width", dimensions.width))
		this.use(() => rectangle.setAttribute("height", dimensions.height))
		this.use(() => rectangle.setAttribute("x", -dimensions.width / 2))
		this.use(() => rectangle.setAttribute("y", -dimensions.height / 2))

		return rectangle
	}
}
