import { RED, glue } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { INNER_RATIO, INNER_UNIT } from "../../unit.js"
import { Flaps } from "../shapes/flaps.js"
import { Line } from "../shapes/line.js"
import { Thing } from "../thing.js"

const DURATION_RATIO = 0.01

export const ArrowOfNoise = class extends Thing {
	duration = this.use(0)
	startingPoint = this.use(0)

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

		const flapOffset = (Math.hypot(6, 6) / 2) * INNER_RATIO - 0.1
		this.startFlaps.transform.position.x = -flapOffset

		this.use(() => {
			this.transform.position.x = -INNER_UNIT / 2 - this.startingPoint * DURATION_RATIO
			this.line.target.transform.position.x = this.duration * DURATION_RATIO + INNER_UNIT
			this.flaps.transform.position.x = this.duration * DURATION_RATIO + INNER_UNIT + flapOffset
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

	onDraggingEnter(previous, state) {
		state.startingStartingPoint = this.startingPoint
	}

	onDraggingPointerMove(event, state) {
		if (state.startingStartingPoint === undefined) return
		const currentPointerPosition = shared.pointer.position
		const movement = currentPointerPosition.x - state.pointerStartPosition.x
		const relativeMovement = this.transform.getRelative([movement, 0])
		this.startingPoint = state.startingStartingPoint - relativeMovement.x / DURATION_RATIO
	}

	onDraggingPointerUp(event, state) {
		this.movement.setAbsoluteVelocity([shared.pointer.velocity.x, 0])
	}

	tick() {
		this.movement.velocity.x *= 0.9
		if (Math.abs(this.movement.velocity.x) < 0.01) this.movement.velocity.x = 0
		if (this.movement.velocity.x === 0) return
		this.startingPoint -= this.movement.velocity.x / DURATION_RATIO
	}
}
