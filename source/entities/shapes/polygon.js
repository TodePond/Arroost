import { SVG, glue } from "../../../libraries/habitat-import.js"
import { Thing } from "../thing.js"

export const Polygon = class extends Thing {
	targets = this.use([], { store: false })

	constructor(points = []) {
		super()
		glue(this)
		for (const point of points) {
			const target = new Thing()
			this.add(target)
			target.transform.position = point
			this.targets.push(target)
		}
		this.targets = this.targets
	}

	addPoint(point) {
		const target = new Thing()
		this.add(target)
		target.transform.position = point
		this.targets.push(target)
		this.targets = this.targets
	}

	render() {
		const { parent } = this
		if (parent === undefined) return

		const polyline = SVG(`<polygon />`)

		this.use(() => polyline.setAttribute("stroke", this.style.stroke))
		this.use(() => polyline.setAttribute("stroke-width", this.style.strokeWidth))
		this.use(() => polyline.setAttribute("fill", this.style.fill))

		this.use(() => {
			polyline.setAttribute(
				"points",
				this.targets.map((target) => target.transform.position).join(" "),
			)
		})

		return polyline
	}
}
