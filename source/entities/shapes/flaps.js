import { WHITE } from "../../../libraries/habitat-import.js"
import { INNER_ATOM_UNIT } from "../../unit.js"
import { Polyline } from "./polyline.js"

export const Flaps = class extends Polyline {
	constructor() {
		super([
			[-6, 0],
			[0, 0],
			[0, -6],
		])

		this.transform.rotation = 45
		this.style.fill = "none"
		this.style.stroke = WHITE
		this.style.strokeWidth = INNER_ATOM_UNIT
		//this.rectangle.dimensions.width = INNER_ATOM_UNIT
		//this.rectangle.dimensions.height = INNER_ATOM_UNIT
	}

	render() {
		const { dimensions } = this.rectangle
		this.use(() => {
			if (this.targets.length !== 3) return
			const [a, b, c] = this.targets
			//a.transform.position.x = -dimensions.width / 2
			//c.transform.position.y = -dimensions.height / 2
		})
		return super.render()
	}
}
