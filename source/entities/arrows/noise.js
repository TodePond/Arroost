import { RED, glue } from "../../../libraries/habitat-import.js"
import { INNER_ATOM_UNIT } from "../../unit.js"
import { Flaps } from "../shapes/flaps.js"
import { Line } from "../shapes/line.js"
import { Thing } from "../thing.js"

export const ArrowOfNoise = class extends Thing {
	duration = this.use(0)

	line = new Line()
	flaps = new Flaps()

	constructor() {
		super()
		glue(this)
		this.add(this.line)
		this.add(this.flaps)
	}

	render() {
		this.line.style.stroke = RED
		this.line.extra = INNER_ATOM_UNIT

		const target = this.line.target
		const { flaps } = this

		target.transform.position.x = 0
		flaps.style.stroke = "none"
		flaps.style.fill = RED

		this.use(() => {
			const y = this.duration * 0.01
			target.transform.position.y = y - flaps.rectangle.dimensions.height
			flaps.transform.position.y = target.transform.position.y
		})
	}
}
