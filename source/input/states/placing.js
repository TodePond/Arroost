import { State } from "../../../libraries/habitat-import.js"
import { setCursor } from "../cursor.js"
import { Idle } from "./idle.js"

export const Placing = new State({
	input: undefined,

	enter(previous) {
		const { input } = previous
		this.input = input
		setCursor("none")
	},

	pointermove(event) {
		const { input } = this
		input.fire("onLand", event)
	},

	pointerup(event) {
		const { input } = this
		input.fire("onPlace", event)
		input.fire("onRelease", event)
		input.pointed = false
		input.dragged = false
		return Idle
	},
})
