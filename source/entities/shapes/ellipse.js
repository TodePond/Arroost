import { SVG } from "../../../libraries/habitat-import.js"
import { Thing } from "../thing.js"

export const Ellipse = class extends Thing {
	constructor() {
		super()
		this.rectangle.dimensions = [10, 10]
	}

	render() {
		const ellipse = SVG(`<ellipse />`)

		const { style } = this
		const { dimensions } = this.rectangle

		this.use(() => ellipse.setAttribute("fill", style.fill))
		this.use(() => ellipse.setAttribute("rx", dimensions.width / 2))
		this.use(() => ellipse.setAttribute("ry", dimensions.height / 2))

		return ellipse
	}
}
