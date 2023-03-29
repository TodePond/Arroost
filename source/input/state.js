import { add, State, subtract } from "../../libraries/habitat-import.js"
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
	pointerStart: undefined,
	cameraStart: undefined,

	enter() {
		const { camera, pointer } = shared
		this.pointerStart = [...pointer.position]
		this.cameraStart = [...camera.transform.position]
		camera.movement.velocity = [0, 0]
		setCursor("move")
	},

	pointerup() {
		const { camera, pointer } = shared
		camera.movement.velocity = [...pointer.velocity]
		return Idle
	},

	pointermove(event) {
		const { camera, pointer } = shared
		const { pointerStart, cameraStart } = this
		const pointerDisplacement = subtract(pointer.position, pointerStart)
		camera.transform.position = add(cameraStart, pointerDisplacement)
	},
})
