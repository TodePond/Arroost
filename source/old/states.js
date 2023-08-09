import { subtract } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"
import { getCell } from "../nogan/nogan.js"
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
		if (event.key.toLowerCase() === "d") {
			event.preventDefault()
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
			const cellId = event.input?.entity?.cell?.id
			if (cellId === undefined) {
				print(cellId)
			} else {
				print(getCell(shared.nogan, cellId))
			}
		} else {
			print(event.input?.entity)
		}
	},
})

export const Pointing = new State({
	name: "Pointing",
	cursor: "pointer",

	onEnter() {
		this.pointerStart = [...shared.pointer.position]
		this.inputStart = [...this.input.entity.transform.position]
		this.offset = subtract(this.pointerStart, this.inputStart)

		this.pointerStartAbsolute = [...shared.pointer.absolutePosition]
		this.inputStartAbsolute = [...this.input.entity.transform.absolutePosition]
		this.offsetAbsolute = subtract(this.pointerStartAbsolute, this.inputStartAbsolute)
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
		this.pointerStart = [...shared.pointer.position]
		this.inputStart = [...this.input.entity.transform.position]
		this.offset = subtract(this.pointerStart, this.inputStart)

		this.pointerStartAbsolute = [...shared.pointer.absolutePosition]
		this.inputStartAbsolute = [...this.input.entity.transform.absolutePosition]
		this.offset = subtract(this.pointerStartAbsolute, this.inputStartAbsolute)
	},

	onPointerUp() {
		return Idle
	},
})
