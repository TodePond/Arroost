import { State } from "../../libraries/habitat-import.js"
import { setCursor } from "./cursor.js"

export const Idle = new State({
	enter() {
		setCursor("default")
	},

	pointerover(event) {
		const { input } = event
		if (input === undefined) return
		return Hovering
	},
})

export const Hovering = new State({
	enter() {
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
})
