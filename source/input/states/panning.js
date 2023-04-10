import { add, State, subtract } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Idle } from "./idle.js"

export const Panning = new State({
	pointerStart: undefined,
	cameraStart: undefined,

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
