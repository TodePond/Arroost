import {
	BLUE,
	GREEN,
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

	constructor(end = [0, 0]) {
		super()
		this.add(this.target)
		this.target.transform.position = end
		this.style.strokeWidth = INNER_ATOM_RATIO
		this.style.stroke = WHITE
		this.style.fill = "none"

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
		debugPath.style.stroke = GREEN
		debugArc.style.stroke = BLUE
		path.style.stroke = WHITE

		this.use(() => {
			const end = target.transform.position
			const start = [0, 0]

			const endAngle = angleBetween(end, start)
			const startAngle = this.startAngle ?? endAngle
			const angle = wrap(endAngle - startAngle, -Math.PI, Math.PI)

			const angleSize = Math.abs(angle)

			let radius = distanceBetween(end, start) / (2 * Math.sin(angleSize / 2))

			if (radius === Infinity) radius = 0

			if (true || (this.angle >= 0 && angle <= 0) || (this.angle <= 0 && angle >= 0)) {
				if (true || (angle < Math.PI / 2 && angle > -Math.PI / 2)) {
					this.sweep = angle >= 0 ? 1 : 0
				}
			}

			this.angle = angle
			const sweep = this.sweep

			const arc = `M ${start} A ${radius} ${radius} 0 0 ${sweep ? 1 : 0} ${end}`

			const transform = `` //`rotate(${(-angle / Math.PI / 2) * 180} ${start})`

			// -- Debug --
			const startProjection = rotate([1000, 0], startAngle)
			const startLine = `M ${start} L ${startProjection}`
			const directLine = `M ${start} L ${end}`
			const fullArc = `M ${start} A ${radius} ${radius} 0 1 ${sweep ? 0 : 1} ${end}`
			const debugArcArc = `M ${start} A ${radius} ${radius} 0 0 ${sweep ? 1 : 0} ${end}`
			// -----------

			const data = [arc].join(" ")
			const debugData = [directLine, startLine].join(" ")
			const debugArcData = [fullArc, debugArcArc].join(" ")

			path.setAttribute("d", data)
			path.setAttribute("transform", transform)
			debugArc.setAttribute("d", debugArcData)
			debugArc.setAttribute("transform", transform)
			debugPath.setAttribute("d", debugData)
		})

		return group
	}
}

const getIntersection = (a, b = { start: [0, 0], end: [10, 0] }) => {
	const x1 = a.start[0]
	const y1 = a.start[1]
	const x2 = a.end[0]
	const y2 = a.end[1]
	const x3 = b.start[0]
	const y3 = b.start[1]
	const x4 = b.end[0]
	const y4 = b.end[1]

	const x =
		((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
		((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))
	const y =
		((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
		((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4))

	return [x, y]
}

const getIntersectionPolar = (a, b = { position: [0, 0], direction: 0 }) => {
	const a1 = Math.tan(a.direction)
	const b1 = a.position.y - a1 * a.position.x
	const a2 = Math.tan(b.direction)
	const b2 = b.position.y - a2 * b.position.x

	const x = (b2 - b1) / (a1 - a2)
	const y = a1 * x + b1

	return [x, y]
}
