import { SVG, WHITE, angleBetween, glue } from "../../../libraries/habitat-import.js"
import { INNER_ATOM_UNIT } from "../../unit.js"
import { Ghost } from "../ghost.js"
import { Thing } from "../thing.js"

export const Line = class extends Thing {
	target = new Ghost()

	// How far to extend or contract the line.
	extra = this.use(0)

	constructor(end = [0, 0]) {
		super()
		this.add(this.target)
		this.target.transform.position = end
		this.style.strokeWidth = INNER_ATOM_UNIT
		this.style.stroke = WHITE
		glue(this)
	}

	render() {
		const { parent, target } = this
		if (parent === undefined) return

		const line = SVG("line")
		line.setAttribute("x1", 0)
		line.setAttribute("y1", 0)

		const end = target.transform.position

		this.use(() => {
			const angle = angleBetween([0, 0], end)
			const actualEnd = [
				end.x + Math.cos(angle) * this.extra,
				end.y + Math.sin(angle) * this.extra,
			]

			line.setAttribute("x2", actualEnd.x)
			line.setAttribute("y2", actualEnd.y)
		})

		return line
	}
}
