import { GREY, SILVER, WHITE, add, scale, subtract } from "../../../libraries/habitat-import.js"
import { setCursor } from "../../input/cursor.js"
import { Dragging, Pointing } from "../../input/states.js"
import { shared } from "../../main.js"
import { Triangle } from "../shapes/triangle.js"

export const ArrowOfRecording = class extends Triangle {
	inner = new Triangle()

	constructor() {
		super()
		const { transform, style, inner, input } = this
		this.add(inner)

		transform.rotation = -90
		style.stroke = "none"
		style.fill = GREY

		inner.transform.scale = [0.6, 0.6]
		inner.style.stroke = "none"
		this.use(() => (inner.style.fill = this.getColour()))
		inner.svg.element.style["pointer-events"] = "none"
	}

	getColour() {
		if (this.input.state === Pointing) return WHITE
		if (this.input.state === Dragging) return WHITE
		return SILVER
	}

	onPointingEnter() {
		this.bringToFront()
	}

	onPointingPointerUp() {
		this.onRecord()
	}

	onDraggingEnter(previous, state) {
		state.pointerStart = [...shared.pointer.position]
		state.start = [...this.transform.absolutePosition]
		this.movement.velocity = [0, 0]
		setCursor("move")
	}

	onDraggingPointerMove(event, state) {
		const { pointerStart, start } = state
		if (pointerStart === undefined) return
		const pointerDisplacement = subtract(shared.pointer.position, pointerStart)
		this.transform.setAbsolutePosition(add(start, pointerDisplacement))
	}

	onDraggingPointerUp() {
		this.movement.setAbsoluteVelocity(shared.pointer.velocity)
	}

	tick() {
		const { movement } = this
		const { velocity } = movement
		movement.update()
		movement.velocity = scale(velocity, 0.9)
	}

	onRecord() {
		print("RECORD")
	}
}
