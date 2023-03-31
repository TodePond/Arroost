import { State } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { setCursor } from "../cursor.js"
import { Hovering } from "./hovering.js"
import { Panning } from "./panning.js"

export const Idle = new State({
	enter() {
		const { hover } = shared
		if (hover.input !== undefined) {
			return Hovering
		}
		setCursor("default")
	},

	pointerover(event) {
		const { input } = event
		if (input === undefined) return
		return Hovering
	},

	pointerdown() {
		return Panning
	},
})
