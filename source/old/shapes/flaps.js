import { Polygon } from "./polygon.js"
import { Polyline } from "./polyline.js"

export const Flaps = class extends Polyline {
	constructor() {
		super([
			[-6, 0],
			[0, 0],
			[0, -6],
		])

		this.transform.rotation = 45
		//this.style.fill = "none"
		//this.style.stroke = WHITE
		//this.style.strokeWidth = INNER_ATOM_UNIT
		//this.rectangle.dimensions.width = INNER_ATOM_UNIT
		//this.rectangle.dimensions.height = INNER_ATOM_UNIT
	}

	render() {
		render.apply(this, [])
		return super.render()
	}
}

const render = function () {
	const { position } = this.transform

	// I tried pulling out some things, but its still really slow.
	// I think the signals library is getting confused and re-rendering loads
	// Let's abandon and delete this file, and lets hardcode everything instead
	const [a, b, c] = this.targets

	const baseCorners = [
		[-6, 0],
		[0, 0],
		[0, -6],
	]

	this.use(() => {
		if (this.style.stroke === "none") return
		if (this.style.strokeWidth === 0) return
		const extra = this.style.strokeWidth / 2
		this.style.strokeWidth
		const displacement = [-extra, -extra]

		let i = 0
		for (const target of [a, b, c]) {
			const base = baseCorners[i]
			target.transform.position.x = base.x + displacement.x
			target.transform.position.y = base.y + displacement.y
			i++
		}
	})
}

export const ClosedFlaps = class extends Polygon {
	constructor() {
		super([
			[-6, 0],
			[0, 0],
			[0, -6],
		])

		this.transform.rotation = 45
	}

	render() {
		render.apply(this, [])
		return super.render()
	}
}
