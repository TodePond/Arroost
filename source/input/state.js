import { State } from "../../libraries/habitat-import.js"
import { setCursor } from "./cursor.js"

export const Idle = new State({
	enter() {
		setCursor("default")
	},

	pointerover(event) {
		const { entity } = event
		if (entity === undefined) return
		return Hovering
	},
})

export const Hovering = new State({
	entity: undefined,

	enter() {
		setCursor("pointer")
	},

	pointerover(event) {
		const { entity } = event
		if (entity !== this.entity) {
			this.entity = entity
		}

		if (entity === undefined) {
			return Idle
		}
	},
})
