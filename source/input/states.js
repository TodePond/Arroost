import { shared } from "../main.js"
import { State } from "./state.js"

export const Idle = new State({
	name: "Idle",
	cursor: "default",

	onEnter() {
		this.input = shared.hover.input
		if (this.input !== undefined) {
			return Hovering
		}
	},

	onPointerOver(event) {
		this.input = event.input
		if (this.input !== undefined) {
			return Hovering
		}
	},
})

export const Hovering = new State({
	name: "Hovering",
	cursor: "pointer",

	onPointerOver(event) {
		if (event.input !== this.input) {
			return Idle
		}
	},

	onPointerDown() {
		return Pointing
	},
})

export const Pointing = new State({
	name: "Pointing",
	cursor: "pointer",

	onEnter() {
		this.pointerStartPosition = [...shared.pointer.position]
		this.pointerStartDisplacedPosition = [...shared.pointer.displacedPosition]
		this.inputStartPosition = [...this.input.entity.transform.absolutePosition]
	},

	onPointerUp() {
		return Idle
	},

	onPointerMove() {
		return Dragging
	},
})

export const Dragging = new State({
	name: "Dragging",
	cursor: "move",

	onEnter(previous) {
		if (previous === Pointing) {
			this.pointerStartPosition = previous.pointerStartPosition
			this.pointerStartDisplacedPosition = previous.pointerStartDisplacedPosition
			this.inputStartPosition = previous.inputStartPosition
		} else {
			this.pointerStartPosition = [...shared.pointer.position]
			this.pointerStartDisplacedPosition = [...shared.pointer.displacedPosition]
			this.inputStartPosition = [...this.input.entity.transform.absolutePosition]
		}
	},

	onPointerUp() {
		return Idle
	},
})
