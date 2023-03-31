import { State } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { setCursor } from "../cursor.js"
import { Idle } from "./idle.js"

export const Hovering = new State({
	enter() {
		const { input } = shared.hover
		input.hovered = true
		setCursor("pointer")
	},

	pointerover(event) {
		const { input } = event
		if (input === undefined) {
			return Idle
		}
		input.hovered = true
	},

	pointerout(event) {
		const { input } = event
		input.hovered = false
		return Idle
	},

	pointerdown(event) {
		const { input } = event
		return input.fire("pointerdown", event)
	},
})
