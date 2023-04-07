import { SVG } from "../../../libraries/habitat-import.js"
import { Thing } from "../thing.js"

export const Line = class extends Thing {
	target = new Thing()

	constructor(end = [10, 0]) {
		super()
		this.add(this.target)
		this.target.transform.position = end
	}

	render() {
		const { parent, target } = this
		if (parent === undefined) return

		const line = SVG(`<line />`)
		line.setAttribute("x1", 0)
		line.setAttribute("y1", 0)

		const end = target.transform.position

		this.use(() => line.setAttribute("stroke", this.style.stroke))
		this.use(() => line.setAttribute("stroke-width", this.style.strokeWidth))
		this.use(() => {
			line.setAttribute("x2", end.x)
			line.setAttribute("y2", end.y)
		})

		return line
	}
}
