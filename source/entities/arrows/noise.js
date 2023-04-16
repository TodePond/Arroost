import { RED, glue } from "../../../libraries/habitat-import.js"
import { Line } from "../shapes/line.js"
import { Thing } from "../thing.js"

export const ArrowOfNoise = class extends Thing {
	duration = this.use(10)

	line = new Line()

	constructor() {
		super()
		glue(this)
		this.add(this.line)
	}

	render() {
		this.line.style.stroke = RED

		const target = this.line.target.d

		this.use(() => {
			target.transform.position.x = 0
			target.transform.position.y = this.duration
		})
	}
}
