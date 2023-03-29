import { State } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"
import { setCursor } from "./cursor.js"

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

	pointerdown(event) {
		return Panning
	},
})

export const Hovering = new State({
	enter() {
		print("HOVER")
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
})

export const Panning = new State({
	enter() {
		setCursor("move")
	},

	pointerup() {
		return Idle
	},

	pointermove(event) {
		const { entity } = event
	},
})
