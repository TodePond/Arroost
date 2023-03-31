import { subtract } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"

export const registerSlide = () => {
	const { camera } = shared
	const { transform } = camera
	addEventListener(
		"wheel",
		(event) => {
			transform.position = subtract(transform.position, [event.deltaX, event.deltaY])
		},
		{ passive: false },
	)
}
