import { GREY, RED, SILVER, clamp, glue } from "../../../libraries/habitat-import.js"
import { setCursor } from "../../input/cursor.js"
import { Dragging } from "../../input/states.js"
import { shared } from "../../main.js"
import { INNER_RATIO, INNER_UNIT, MARGIN_UNIT } from "../../unit.js"
import { Flaps } from "../shapes/flaps.js"
import { Line } from "../shapes/line.js"
import { Thing } from "../thing.js"

const DURATION_RATIO = 0.01

export const ArrowOfNoise = class extends Thing {
	duration = this.use(0)
	startingPoint = this.use(0)

	trimEnd = this.use(0)
	trimStart = this.use(0)

	line = new Line()
	backLine = new Line()
	flaps = new Flaps()
	startFlaps = new Flaps()

	recording = this.use(() => {
		if (!this.parent) return false
		return this.parent.parent.recording
	})

	colour = this.use(() => {
		return RED
	})

	constructor() {
		super()
		glue(this)
		//this.add(this.backLine)
		this.add(this.line)
		this.add(this.flaps)
		this.add(this.startFlaps)
	}

	render() {
		//this.line.extra = INNER_ATOM_UNIT

		const { flaps } = this

		flaps.style.stroke = "none"
		flaps.style.strokeWidth = 0
		flaps.transform.scale = [INNER_RATIO, INNER_RATIO]
		flaps.transform.rotation = -45

		this.startFlaps.style.stroke = "none"
		this.startFlaps.strokeWidth = 0
		this.startFlaps.transform.scale = [INNER_RATIO, INNER_RATIO]
		this.startFlaps.transform.rotation = 45 + 90 * 1

		const flapOffset = (Math.hypot(6, 6) / 2) * INNER_RATIO - 0.1

		this.use(() => {
			this.transform.position.x =
				-INNER_UNIT / 2 -
				MARGIN_UNIT -
				this.startingPoint * DURATION_RATIO +
				this.trimStart * DURATION_RATIO
			this.line.target.transform.position.x =
				INNER_UNIT +
				MARGIN_UNIT * 2 +
				this.trimEnd * DURATION_RATIO -
				this.trimStart * DURATION_RATIO
			// this.backLine.target.transform.position.x =
			// 	this.duration * DURATION_RATIO + INNER_UNIT + MARGIN_UNIT * 2
		})

		this.use(() => {
			this.flaps.transform.position.x =
				INNER_UNIT +
				MARGIN_UNIT * 2 +
				flapOffset +
				this.trimEnd * DURATION_RATIO -
				this.trimStart * DURATION_RATIO
			this.startFlaps.transform.position.x = -flapOffset
		})

		this.use(() => {
			if (this.recording) {
				//this._input = this.input
				//this.input = this.parent.parent.input
			} else {
				//this.input = this._input
			}
		})

		this.use(() => {
			this.line.style.stroke = this.recording ? RED : GREY
			flaps.style.fill = SILVER
			this.startFlaps.style.fill = SILVER
		})

		this.backLine.style.stroke = GREY
		this.line.input = this.input

		this.flaps.onHoveringEnter = this.onEndHoveringEnter
		this.startFlaps.onHoveringEnter = this.onEndHoveringEnter
		this.flaps.onPointingPointerDown = this.onEndPointingPointerDown
		this.startFlaps.onPointingPointerDown = this.onEndPointingPointerDown
		this.flaps.onDraggingPointerMove = (event, state) => {
			return this.onEndDraggingPointerMove(event, state, "End")
		}
		this.startFlaps.onDraggingPointerMove = (event, state) => {
			return this.onEndDraggingPointerMove(event, state, "Start")
		}
		this.flaps.onDraggingEnter = (previous, state) => {
			return this.onEndDraggingEnter(previous, state, "End")
		}
		this.startFlaps.onDraggingEnter = (previous, state) => {
			return this.onEndDraggingEnter(previous, state, "Start")
		}
	}

	onEndHoveringEnter() {
		setCursor("ew-resize")
	}

	onEndPointingPointerDown() {
		return Dragging
	}

	onEndDraggingEnter(previous, state, side) {
		state.trimStartingPoint = this["trim" + side]
		setCursor("ew-resize")
	}

	onEndDraggingPointerMove(event, state, side) {
		if (state.trimStartingPoint === undefined) return
		const currentPointerPosition = shared.pointer.position
		const movement = currentPointerPosition.x - state.pointerStartPosition.x
		const relativeMovement = this.transform.getRelative([movement, 0])
		const trim = state.trimStartingPoint + relativeMovement.x / DURATION_RATIO
		if (side === "Start") this.trimStart = clamp(trim, 0.1, this.trimEnd)
		if (side === "End") this.trimEnd = clamp(trim, this.trimStart - 0.1, this.duration)
	}

	onHoveringEnter() {
		setCursor("move")
	}

	onDraggingEnter(previous, state) {
		state.startingStartingPoint = this.startingPoint
	}

	onDraggingPointerMove(event, state) {
		if (state.startingStartingPoint === undefined) return
		const currentPointerPosition = shared.pointer.position
		const movement = currentPointerPosition.x - state.pointerStartPosition.x
		const relativeMovement = this.transform.getRelative([movement, 0])
		const startingPoint = state.startingStartingPoint - relativeMovement.x / DURATION_RATIO
		this.startingPoint = clamp(startingPoint, 0, this.duration)
	}

	onDraggingPointerUp(event, state) {
		this.movement.setAbsoluteVelocity([shared.pointer.velocity.x, 0])
	}

	onPointingPointerDown() {
		return Dragging
	}

	tick() {
		this.movement.velocity.x *= 0.9
		if (Math.abs(this.movement.velocity.x) < 0.01) this.movement.velocity.x = 0
		if (this.movement.velocity.x === 0) return
		const startingPoint = this.startingPoint - this.movement.velocity.x / DURATION_RATIO
		this.startingPoint = clamp(startingPoint, 0, this.duration)
	}
}
