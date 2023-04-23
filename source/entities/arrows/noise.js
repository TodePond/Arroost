import { RED, glue } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { INNER_RATIO } from "../../unit.js"
import { Flaps } from "../shapes/flaps.js"
import { Line } from "../shapes/line.js"
import { Thing } from "../thing.js"

export const ArrowOfNoise = class extends Thing {
	duration = this.use(0)

	line = new Line()
	flaps = new Flaps()
	startFlaps = new Flaps()

	constructor() {
		super()
		glue(this)
		this.add(this.flaps)
		this.add(this.startFlaps)
		this.add(this.line)
	}

	recording = this.use(() => {
		if (!this.parent) return false
		return this.parent.parent.recording
	})

	render() {
		this.line.style.stroke = RED
		//this.line.extra = INNER_ATOM_UNIT

		const target = this.line.target
		const { flaps } = this

		flaps.style.stroke = "none"
		flaps.style.fill = RED
		flaps.style.strokeWidth = 0
		flaps.transform.scale = [INNER_RATIO, INNER_RATIO]
		flaps.transform.rotation = -45

		this.startFlaps.style.stroke = "none"
		this.startFlaps.strokeWidth = 0
		this.startFlaps.style.fill = RED
		this.startFlaps.transform.scale = [INNER_RATIO, INNER_RATIO]
		this.startFlaps.transform.rotation = 45 + 90 * 1

		this.use(() => {
			if (this.transform.position.x > 0) {
				this.startFlaps.style.visibility = "hidden"
				this.startFlaps.style.pointerEvents = "none"
			} else {
				this.startFlaps.style.visibility = "visible"
				this.startFlaps.style.pointerEvents = "all"
			}

			const lineLength = target.transform.position.x
			if (this.transform.position.x + lineLength < 0) {
				this.flaps.style.visibility = "hidden"
				this.flaps.style.pointerEvents = "none"
			} else {
				this.flaps.style.visibility = "visible"
				this.flaps.style.pointerEvents = "all"
			}
		})

		this.use(() => {
			const x = this.duration * 0.01
			target.transform.position.x = x

			const flapOffset = (Math.hypot(6, 6) / 2) * INNER_RATIO - 0.1
			flaps.transform.position.x = x + flapOffset
			this.startFlaps.transform.position.x = -flapOffset
		})

		this.use(() => {
			if (this.recording) {
				this.line.style.pointerEvents = "none"
				this.flaps.style.pointerEvents = "none"
			} else {
				this.line.style.pointerEvents = "all"
				this.flaps.style.pointerEvents = "all"
			}
		})

		this.line.input = this.input
	}

	onDraggingPointerMove(event, state) {
		const currentPointerPosition = shared.pointer.position
		const movement = currentPointerPosition.x - state.pointerStartPosition.x
		this.transform.setAbsolutePosition([
			state.inputStartPosition.x + movement,
			state.inputStartPosition.y,
		])
	}
}
