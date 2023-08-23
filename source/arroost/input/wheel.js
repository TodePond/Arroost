import { repeatArray, subtract } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"

const ZOOM_MOUSE_SPEED = 0.00075
const ZOOM_TRACKPAD_SPEED = 0.01
export const registerWheel = () => {
	addEventListener(
		"wheel",
		(event) => {
			// const isTrackpad = true // Math.abs(event.deltaY) < 20
			if (event.ctrlKey) {
				const isTrackpad = Math.abs(event.deltaY) < 20
				const delta = event.deltaY * (isTrackpad ? ZOOM_TRACKPAD_SPEED : ZOOM_MOUSE_SPEED)
				shared.scene.zoomSpeed.set(delta)
				return
			}

			const transform = shared.scene?.dom.transform
			if (!transform) return

			const position = subtract(transform.position.get(), [event.deltaX, event.deltaY])
			transform.position.set(position)
		},
		{ passive: false },
	)
}
