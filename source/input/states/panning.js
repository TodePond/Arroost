import { add, State, subtract } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { setCursor } from "../cursor.js"
import { Idle } from "./idle.js"

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

	pointermove() {
		const { camera, pointer } = shared
		const { pointerStart, cameraStart } = this
		const pointerDisplacement = subtract(pointer.position, pointerStart)
		camera.transform.position = add(cameraStart, pointerDisplacement)
	},
})
