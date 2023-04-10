import { State } from "./state.js"

export const Hovering = new State({
	name: "Hovering",
	cursor: "default",

	onPointerDown() {
		return Pointing
	},
})

export const Pointing = new State({
	name: "Pointing",
	cursor: "pointer",

	onPointerUp() {
		return Hovering
	},

	onPointerMove() {
		return Dragging
	},
})

export const Dragging = new State({
	name: "Dragging",
	cursor: "move",

	onPointerUp() {
		return Hovering
	},
})

export const Carrying = new State({
	name: "Carrying",
	cursor: "none",
})
