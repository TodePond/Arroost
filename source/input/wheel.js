import { scale, subtract } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"

export const registerWheel = () => {
	const { camera, pointer } = shared
	const { transform } = camera
	addEventListener(
		"wheel",
		(event) => {
			event.preventDefault()
			if (event.ctrlKey) {
				const delta = event.deltaY / 100
				const scaleMultiplier = 1 - delta
				const oldScale = transform.scale
				transform.scale = scale(transform.scale, scaleMultiplier)
				const newScale = transform.scale

				return
			}
			transform.position = subtract(transform.position, [event.deltaX, event.deltaY])
		},
		{ passive: false },
	)
}
