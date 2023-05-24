import { SVG, WHITE, angleBetween, glue } from "../../../../libraries/habitat-import.js"
import { INNER_ATOM_UNIT } from "../../unit.js"
import { Ghost } from "../ghost.js"
import { Thing } from "../thing.js"

export const Curve = class extends Thing {
	target = new Ghost()

	startAngle = this.use(null)
	endAngle = this.use(null)

	// How far to extend or contract the line.
	extra = this.use(0)

	constructor(end = [0, 0], debug = false) {
		super()
		this.add(this.target)
		this.target.transform.position = end
		this.style.strokeWidth = INNER_ATOM_UNIT
		this.style.stroke = WHITE
		this.style.fill = "none"

		if (debug) {
			this.startDebug = new Ghost(true)
			this.endDebug = new Ghost(true)
			this.add(this.startDebug)
			this.add(this.endDebug)
			this.debug = true
		}

		glue(this)
	}

	render() {
		const { parent, target } = this
		if (parent === undefined) return

		const path = SVG("path")
		const end = target.transform.position

		this.use(() => {
			const angle = angleBetween([0, 0], end)
			const extra = Math.max(this.extra, 0)

			const actualEnd = [end.x + Math.cos(angle) * extra, end.y + Math.sin(angle) * extra]
			const actualDistance = Math.hypot(actualEnd.x, actualEnd.y)

			let ds = ["M 0 0"]

			if (this.startAngle !== null) {
				ds.push(
					`Q ${(Math.cos(this.startAngle) * -actualDistance) / 2} ${
						(Math.sin(this.startAngle) * -actualDistance) / 2
					} ${actualEnd.x} ${actualEnd.y}`,
				)
			}

			path.setAttribute("d", ds.join(" "))
		})

		return path
	}
}
