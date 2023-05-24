import { SVG, WHITE, angleBetween, glue } from "../../../../libraries/habitat-import.js"
import { INNER_ATOM_UNIT } from "../../unit.js"
import { Ghost } from "../ghost.js"
import { Thing } from "../thing.js"

export const Curve = class extends Thing {
	target = new Ghost()

	// Start and end of the curve
	// Not necessarily the start and end of the line
	curveStartTarget = new Ghost()
	curveEndTarget = new Ghost()

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

		const path = SVG("path")

		const end = target.transform.position

		this.use(() => {
			const angle = angleBetween([0, 0], end)
			const actualEnd = [
				end.x + Math.cos(angle) * this.extra,
				end.y + Math.sin(angle) * this.extra,
			]
			path.setAttribute("d", `M 0 0 L ${actualEnd.x} ${actualEnd.y}`)
		})

		return path
	}
}
