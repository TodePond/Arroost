import { SVG, WHITE, angleBetween, glue } from "../../../../libraries/habitat-import.js"
import { INNER_ATOM_UNIT } from "../../unit.js"
import { Ghost } from "../ghost.js"
import { Thing } from "../thing.js"

export const Curve = class extends Thing {
	target = new Ghost(true)

	// Start and end of the curve
	// Not necessarily the start and end of the line
	curveStartTarget = new Ghost(true)
	curveEndTarget = new Ghost(true)

	// How far to extend or contract the line.
	extra = this.use(0)

	constructor(end = [0, 0]) {
		super()
		this.add(this.target)
		this.add(this.curveStartTarget)
		this.add(this.curveEndTarget)
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
		const curveStart = this.curveStartTarget.transform.position
		const curveEnd = this.curveEndTarget.transform.position

		this.use(() => {
			const angle = angleBetween([0, 0], end)
			const actualEnd = [
				end.x + Math.cos(angle) * this.extra,
				end.y + Math.sin(angle) * this.extra,
			]
			path.setAttribute(
				"d",
				`M 0 0 L ${curveStart.x} ${curveStart.y} ${curveEnd.x} ${curveEnd.y} ${actualEnd.x} ${actualEnd.y}`,
			)
		})

		return path
	}
}
