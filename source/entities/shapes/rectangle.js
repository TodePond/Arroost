import { SVG } from "../../../libraries/habitat-import.js"
import { Thing } from "../thing.js"

export const Rectangle = class extends Thing {
	constructor() {
		super()
		this.rectangle.dimensions = [10, 10]
	}

	render() {
		const rectangle = SVG(`<rect />`)

		const { style } = this
		const { dimensions } = this.rectangle

		this.use(() => rectangle.setAttribute("fill", style.fill))
		this.use(() => rectangle.setAttribute("width", dimensions.width))
		this.use(() => rectangle.setAttribute("height", dimensions.height))

		return rectangle
	}
}
