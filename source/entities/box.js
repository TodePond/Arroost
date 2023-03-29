import { SVG } from "../../libraries/habitat-import.js"
import { Thing } from "./thing.js"

export const Box = class extends Thing {
	render() {
		const rectangle = SVG(`<rect />`)

		this.use(() => rectangle.setAttribute("fill", this.style.fill))
		this.use(() => rectangle.setAttribute("width", this.rectangle.scaledDimensions.width))
		this.use(() => rectangle.setAttribute("height", this.rectangle.scaledDimensions.height))

		return rectangle
	}
}
