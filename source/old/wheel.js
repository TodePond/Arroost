import { subtract } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"

const ZOOM_MOUSE_SPEED = 0.00075
const ZOOM_TRACKPAD_SPEED = 0.01
export const registerWheel = () => {
	const { scene, pointer } = shared
	const { transform } = scene

	addEventListener(
		"wheel",
		(event) => {
			event.preventDefault()
			// pointer.position = [event.clientX, event.clientY]

			const isTrackpad = Math.abs(event.deltaY) < 20
			if (!isTrackpad || event.ctrlKey) {
				// const isTrackpad = Math.abs(event.deltaY) < 20
				// const delta = event.deltaY * (isTrackpad ? ZOOM_TRACKPAD_SPEED : ZOOM_MOUSE_SPEED)
				// scene.zoomSpeed = delta
				return
			}

			const position = subtract(transform.position.get(), [-event.deltaX, -event.deltaY])
			transform.position.set(position)
		},
		{ passive: false },
	)
}
