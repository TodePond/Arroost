import {
	BLUE,
	RED,
	SVG,
	WHITE,
	angleBetween,
	distanceBetween,
	glue,
	rotate,
	wrap,
} from "../../../../libraries/habitat-import.js"
import { INNER_ATOM_RATIO } from "../../unit.js"
import { Ghost } from "../ghost.js"
import { Thing } from "../thing.js"

export const Curve = class extends Thing {
	target = new Ghost()

	startAngle = this.use(null)
	sweep = 1
	angle = 0
	full = 0

	constructor(end = [0, 0], debug = false) {
		super()
		this.add(this.target)
		this.target.transform.position = end
		this.style.strokeWidth = INNER_ATOM_RATIO
		this.style.stroke = WHITE
		this.style.fill = "none"
		this.debug = debug

		glue(this)
	}

	render() {
		const { parent, target } = this
		if (parent === undefined) return

		const group = SVG("g")
		const path = SVG("path")
		const debugPath = SVG("path")
		const debugArc = SVG("path")

		group.append(path)
		group.append(debugPath)
		group.append(debugArc)

		debugPath.style.strokeWidth = 0.5
		debugArc.style.strokeWidth = 0.5
		debugPath.style.stroke = RED
		debugArc.style.stroke = BLUE
		path.style.stroke = WHITE

		this.use(() => {
			// Positioning
			const end = target.transform.position
			const start = [0, 0]
			const middle = [end.x / 2, end.y / 2]

			// Angle
			const endAngle = angleBetween(end, start)
			const startAngle = this.startAngle ?? endAngle
			const angle = wrap(endAngle - startAngle, -Math.PI, Math.PI)
			const middleAngle = endAngle - Math.PI / 2

			// Slope
			const slope = startAngle
			const normal = rotate([0, -1], slope)
			const normalAngle = angleBetween(normal, [0, 0])

			// Radius of circle
			const center = getIntersection(
				{ position: start, direction: normalAngle },
				{ position: middle, direction: middleAngle },
			)

			if (!Number.isFinite(center.x)) {
				center.x = 0
			}

			if (!Number.isFinite(center.y)) {
				center.y = 0
			}

			let radius = distanceBetween(start, center)
			if (!Number.isFinite(radius)) {
				radius = 0
			}

			// Sweep
			this.sweep = angle > 0 ? 1 : 0
			this.full = Math.abs(angle) > Math.PI / 2 ? 1 : 0
			this.angle = angle

			const sweep = this.sweep
			const full = this.full

			const arc = `M ${start} A ${radius} ${radius} 0 ${full} ${sweep ? 1 : 0} ${end}`
			const data = [arc].join(" ")
			path.setAttribute("d", data)

			// -- Debug --
			if (!this.debug) return
			const startProjection = rotate([1000, 0], startAngle)
			const normalProjection = rotate([1000, 0], normalAngle)
			const antiNormalProjection = rotate([1000, 0], normalAngle + Math.PI)

			const startLine = `M ${start} L ${startProjection}`
			const directLine = `M ${start} L ${end}`
			const normalLine = `M ${start} L ${normalProjection}`
			const antiNormalLine = `M ${start} L ${antiNormalProjection}`
			const middleLine = `M ${middle} L ${center}`

			const fullArc = `M ${start} A ${radius} ${radius} 0 ${full ? 0 : 1} ${
				sweep ? 0 : 1
			} ${end}`
			const debugArcArc = `M ${start} A ${radius} ${radius} 0 ${full} ${sweep ? 1 : 0} ${end}`

			const debugData = [directLine, startLine, normalLine, middleLine, antiNormalLine].join(
				" ",
			)
			const debugArcData = [fullArc, debugArcArc].join(" ")

			debugArc.setAttribute("d", debugArcData)
			debugPath.setAttribute("d", debugData)
			// -----------
		})

		return group
	}
}

const getIntersection = (a, b = { position: [0, 0], direction: 0 }) => {
	const a1 = Math.tan(a.direction)
	const b1 = a.position.y - a1 * a.position.x
	const a2 = Math.tan(b.direction)
	const b2 = b.position.y - a2 * b.position.x

	const x = (b2 - b1) / (a1 - a2)
	const y = a1 * x + b1

	return [x, y]
}
