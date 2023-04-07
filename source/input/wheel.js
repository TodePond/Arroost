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
				transform.scale = [newZoom, newZoom]

				const pointerOffset = subtract(pointer.position, transform.position)
				const scaleRatio = newZoom / oldZoom
				const scaledPointerOffset = scale(pointerOffset, scaleRatio)
				transform.position = subtract(pointer.position, scaledPointerOffset)
				return
			}
			transform.position = subtract(transform.position, [event.deltaX, event.deltaY])
		},
		{ passive: false },
	)
}
