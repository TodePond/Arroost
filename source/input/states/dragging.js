import { State } from "../../../libraries/habitat-import.js"
import { setCursor } from "../cursor.js"
import { Idle } from "./idle.js"

export const Dragging = new State({
	input: undefined,

	enter(previous) {
		const { input } = previous
		this.input = input
		setCursor("none")
	},

	pointermove(event) {
		const { input } = this
		input.fire("onDrag", event)
	},

	pointerup(event) {
		const { input } = this
		input.fire("onDrop", event)
		input.pointed = false
		input.dragged = false
		return Idle
	},
})
