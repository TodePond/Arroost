import { scale, subtract } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"

const ZOOM_SPEED = 0.01
export const registerWheel = () => {
	const { camera, pointer } = shared
	const { transform } = camera
	addEventListener(
		"wheel",
		(event) => {
			event.preventDefault()
			if (event.ctrlKey) {
				if (pointer.position.x === undefined) return
				const delta = event.deltaY * ZOOM_SPEED
				const oldZoom = transform.scale.x
				const newZoom = oldZoom * (1 - delta)
				const scaleRatio = newZoom / oldZoom
				transform.scale = [newZoom, newZoom]

				const pointerOffset = subtract(pointer.position, transform.position)
				const scaledPointerOffset = scale(pointerOffset, scaleRatio)
				const newCameraPosition = subtract(pointer.position, scaledPointerOffset)
				transform.position = newCameraPosition
				return
			}
			transform.position = subtract(transform.position, [event.deltaX, event.deltaY])
		},
		{ passive: false },
	)
}
