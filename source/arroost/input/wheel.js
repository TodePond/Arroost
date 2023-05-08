import { subtract } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"

const ZOOM_MOUSE_SPEED = 0.00075
const ZOOM_TRACKPAD_SPEED = 0.01
export const registerWheel = () => {
	const { camera, pointer } = shared
	const { transform } = camera
	addEventListener(
		"wheel",
		(event) => {
			event.preventDefault()
			pointer.position = [event.clientX, event.clientY]

			const isTrackpad = Math.abs(event.deltaY) < 20
			if (!isTrackpad || event.ctrlKey) {
				const isTrackpad = Math.abs(event.deltaY) < 20
				const delta = event.deltaY * (isTrackpad ? ZOOM_TRACKPAD_SPEED : ZOOM_MOUSE_SPEED)
				camera.zoomSpeed = delta
				return
			}

			transform.position = subtract(transform.position, [event.deltaX, event.deltaY])
		},
		{ passive: false },
	)
}
