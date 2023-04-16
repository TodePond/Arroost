import { SVG } from "../../../libraries/habitat-import.js"
import { Thing } from "../thing.js"

export const Ellipse = class extends Thing {
	constructor(dimensions = [10, 10]) {
		super()
		this.rectangle.dimensions = dimensions
	}

	render() {
		const ellipse = SVG(`<ellipse />`)

		const { dimensions } = this.rectangle

		this.use(() => ellipse.setAttribute("rx", dimensions.width / 2))
		this.use(() => ellipse.setAttribute("ry", dimensions.height / 2))

		return ellipse
	}
}
