import { shared } from "../main.js"
import { State } from "./state.js"

// Idle is only the default state when you load.
// After the first frame, you'll be hovering the display.
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

	onKeyDown(event) {
		event.preventDefault()
		if (event.key.toLowerCase() === "d") {
			return Debugging
		}
	},
})

export const Debugging = new State({
	name: "Debugging",
	cursor: "help",

	onKeyUp(event) {
		if (event.key.toLowerCase() === "d") {
			return Idle
		}
	},

	onPointerDown(event) {
		if (event.shiftKey) {
			print(event.input)
		} else if (event.ctrlKey) {
			print(event.input?.entity?.nogan)
		} else {
			print(event.input?.entity)
		}
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
