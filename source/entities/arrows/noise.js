import { RED, glue } from "../../../libraries/habitat-import.js"
import { Line } from "../shapes/line.js"

export const ArrowOfNoise = class extends Line {
	duration = this.use(0)

	constructor() {
		super()
		glue(this)
	}

	render() {
		this.style.stroke = RED
		this.use(() => {
			this.target.transform.position.x = this.duration
		})
	}
}
