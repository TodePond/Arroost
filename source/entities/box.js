import { SVG, use } from "../../libraries/habitat-import.js"
import { Thing } from "./thing.js"

export const Box = class extends Thing {
	render() {
		const rectangle = SVG(`<rect />`)

		use(() => rectangle.setAttribute("fill", this.style.fill))
		use(() => rectangle.setAttribute("width", this.rectangle.scaledDimensions.width))
		use(() => rectangle.setAttribute("height", this.rectangle.scaledDimensions.height))

		return rectangle
	}
}
