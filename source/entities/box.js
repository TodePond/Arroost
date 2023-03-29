import { SVG } from "../../libraries/habitat-import.js"
import { Thing } from "./thing.js"

export const Box = class extends Thing {
	constructor() {
		super()
		this.rectangle.dimensions = [10, 10]
	}

	render() {
		const rectangle = SVG(`<rect />`)

		this.use(() => rectangle.setAttribute("fill", this.style.fill))
		this.use(() => rectangle.setAttribute("width", this.rectangle.dimensions.width))
		this.use(() => rectangle.setAttribute("height", this.rectangle.dimensions.height))

		return rectangle
	}
}
