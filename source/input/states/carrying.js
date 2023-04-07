import { State } from "../../../libraries/habitat-import.js"
import { setCursor } from "../cursor.js"
import { Placing } from "./placing.js"

export const Carrying = new State({
	input: undefined,

	enter(previous) {
		const { input } = previous
		this.input = input
		setCursor("none")
	},

	pointermove(event) {
		const { input } = this
		input.fire("onCarry", event)
	},

	pointerdown(event) {
		const { input } = this
		input.fire("onLand", event)
		return Placing
	},
})
