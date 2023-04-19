import { SVG, WHITE } from "../../../libraries/habitat-import.js"
import { INNER_ATOM_UNIT } from "../../unit.js"
import { Thing } from "../thing.js"

export const Line = class extends Thing {
	target = new Thing()

	constructor(end = [0, 0]) {
		super()
		this.add(this.target)
		this.target.transform.position = end
		this.style.strokeWidth = INNER_ATOM_UNIT
		this.style.stroke = WHITE
	}

	render() {
		const { parent, target } = this
		if (parent === undefined) return

		const line = SVG(`<line />`)
		line.setAttribute("x1", 0)
		line.setAttribute("y1", 0)

		const end = target.transform.position

		this.use(() => {
			line.setAttribute("x2", end.x)
			line.setAttribute("y2", end.y)
		})

		return line
	}
}
