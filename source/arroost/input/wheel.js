import { fireEvent, repeatArray, subtract } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { triggerSomethingHasMoved } from "../machines/hover.js"

const ZOOM_MOUSE_SPEED = 0.025
const ZOOM_TRACKPAD_SPEED = 0.01

const RIGHT_CLICK_PITY_EASE_DURATION = 700

let pityTime = -Infinity
export const triggerRightClickPity = () => {
	pityTime = shared.clock.time
}

export const registerWheel = () => {
	addEventListener(
		"wheel",
		(event) => {
			if (event.ctrlKey || event.metaKey) {
				const isTrackpad = Math.abs(event.deltaY) < 16
				if (isTrackpad) {
					const delta = event.deltaY * ZOOM_TRACKPAD_SPEED
					shared.scene.zoomSpeed.set(delta)
				} else {
					shared.zoomer.desiredSpeed += shared.zoomer.smoothMode
						? Math.sign(event.deltaY)
						: Math.sign(event.deltaY) * ZOOM_MOUSE_SPEED
				}
				return
			}

			const isTrackpad = event.deltaX % 1 === 0 && event.deltaY % 1 === 0

			if (!isTrackpad) {
				shared.zoomer.desiredSpeed += shared.zoomer.smoothMode
					? Math.sign(event.deltaY)
					: Math.sign(event.deltaY) * ZOOM_MOUSE_SPEED
				return
			}

			const transform = shared.scene?.dom.transform
			if (!transform) return

			let [dx, dy] = [event.deltaX, event.deltaY]

			const timeSincePity = shared.clock.time - pityTime
			if (timeSincePity < RIGHT_CLICK_PITY_EASE_DURATION) {
				const t = timeSincePity / RIGHT_CLICK_PITY_EASE_DURATION
				dx = dx * t ** 4
				dy = dy * t ** 4
			}

			const position = subtract(transform.position.get(), [dx, dy])
			transform.position.set(position)
			triggerSomethingHasMoved()
			fireEvent("pointermove", {
				clientX: event.clientX,
				clientY: event.clientY,
				pointerId: -1,
				target: window, //maybe needs to be more specific?
			})
		},
		{ passive: false },
	)

	addEventListener("keydown", (e) => {
		if (e.key === "s") {
			shared.zoomer.smoothMode = !shared.zoomer.smoothMode
			shared.zoomer.desiredSpeed = 0
		} else if (e.key === "r") {
			shared.zoomer.desiredSpeed = 0
		}
	})
}
