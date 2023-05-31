import {
	SVG,
	WHITE,
	add,
	angleBetween,
	clamp,
	distanceBetween,
	glue,
	rotate,
} from "../../../../libraries/habitat-import.js"
import { INNER_ATOM_RATIO } from "../../unit.js"
import { Ghost } from "../ghost.js"
import { Thing } from "../thing.js"

export const Curve = class extends Thing {
	target = new Ghost()

	startAngle = this.use(null)

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

		const path = SVG("path")

		this.use(() => {
			const start = [0, 0]
			const end = target.transform.position

			const startAngle = this.startAngle ?? angleBetween(end, start)
			const startAngleLine = [rotate([-1000, 0], startAngle), rotate([1000, 0], startAngle)]

			const endAngle = angleBetween(start, end)

			const midpoint = [end.x / 2, end.y / 2]
			const midpointAngle = angleBetween(midpoint, start)
			const midpointLine = [rotate([-1000, 0], midpointAngle), rotate([1000, 0], midpointAngle)]

			const midpointLineNormal = [
				rotate(midpointLine[0], -Math.PI / 2, midpoint),
				rotate(midpointLine[1], -Math.PI / 2, midpoint),
			]

			// Point of intersection between the midpointLineNormal and the startAngleLine
			const intersection = getIntersection(
				{ position: midpoint, direction: midpointAngle - Math.PI / 2 },
				{ position: start, direction: startAngle },
			)

			const intersectionAngle = angleBetween(intersection, end)
			const intersectionLine = add(intersection, [
				Math.cos(intersectionAngle) * -1000,
				Math.sin(intersectionAngle) * -1000,
			])

			const intersectionDistance = distanceBetween(intersection, start)
			const endDistance = distanceBetween(end, start)

			const maxIntersectionDistance = endDistance
			const minIntersectionDistance = 0
			const limitedIntersectionDistance = clamp(
				intersectionDistance,
				minIntersectionDistance,
				maxIntersectionDistance,
			)

			const limitedIntersection = [
				start.x + limitedIntersectionDistance * Math.cos(startAngle),
				start.y + limitedIntersectionDistance * Math.sin(startAngle),
			]
			const reflectionLine = add(limitedIntersection, [
				Math.cos(endAngle) * -1000,
				Math.sin(endAngle) * -1000,
			])

			const reflectedIntersection = getIntersection(
				{ position: limitedIntersection, direction: endAngle },
				{ position: end, direction: angleBetween(end, intersection) },
			)

			const controlReflectedAngle = angleBetween(reflectedIntersection, end)
			const controlDistance = limitedIntersectionDistance / 2

			const limitedControl = [
				add(start, [
					Math.cos(startAngle) * controlDistance,
					Math.sin(startAngle) * controlDistance,
				]),
				add(end, [
					Math.cos(controlReflectedAngle) * controlDistance,
					Math.sin(controlReflectedAngle) * controlDistance,
				]),
			]

			const data = [
				`M ${start} L ${startAngleLine[1]}`,
				`M ${start} L ${end}`,
				`M ${midpointLineNormal[0]} L ${midpointLineNormal[1]}`,
				// `M ${end} L ${intersection}`,
				`M ${end} L ${intersectionLine}`,
				// `M ${end} L ${reflectedIntersection}`,
				// // `M ${start} S ${intersection} ${end}`,
				// `M ${start} L ${limitedIntersection} ${end}`,
				// // `M ${start} S ${limitedIntersection} ${end}`,
				// `M ${limitedIntersection} L ${reflectionLine}`,
				// `M ${start} L ${reflectedIntersection}`,
				// `M ${limitedControl[0]} L ${limitedControl[1]}`,
				`M ${start} C ${limitedControl[0]} ${limitedControl[1]} ${end}`,
			].join(" ")
			path.setAttribute("d", data)
		})

		return path
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
