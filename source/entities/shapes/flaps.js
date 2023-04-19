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
		this.use(() => {
			if (this.targets.length !== 3) return
			const [a, b, c] = this.targets
			if (this.style.stroke === "none") return
			if (this.style.strokeWidth === 0) return
			//a.transform.position.x =
		})
		return super.render()
	}
}
