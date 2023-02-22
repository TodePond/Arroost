import { add, scale, subtract } from "../../libraries/habitat-import.js"
import { shared } from "../shared.js"

export const Camera = class {
	pan = [0, 0]
	zoom = 1.0

	ZOOM_SPEED = 0.1
	ZOOM_FRICTION = 0.9
	PAN_FRICTION = 0.9

	panVelocity = [0, 0]
	zoomSpeed = 0

	draw(layers) {
		const [context, html] = layers

		context.clearRect(0, 0, context.canvas.width, context.canvas.height)
		context.save()
		context.translate(...shared.camera.pan)

		shared.world.draw(layers)

		context.restore()
	}

	tick() {
		if (!shared.pointer.down) {
			this.pan = add(this.pan, this.panVelocity)
			this.panVelocity = scale(this.panVelocity, this.PAN_FRICTION)
		}
	}

	registerControls(canvas) {
		const onWheel = (event) => {
			event.preventDefault()
			this.zoomSpeed += event.deltaY * this.ZOOM_SPEED
		}

		const onPointerDown = (event) => {
			event.preventDefault()
			canvas.setPointerCapture(event.pointerId)

			const start = [event.clientX, event.clientY]
			const offset = subtract(this.pan, start)

			const onPointerMove = (event) => {
				event.preventDefault()
				const end = [event.clientX, event.clientY]
				this.pan = add(end, offset)
			}

			const onPointerUp = (event) => {
				event.preventDefault()
				canvas.releasePointerCapture(event.pointerId)
				canvas.removeEventListener("pointermove", onPointerMove)
				this.panVelocity = shared.pointer.velocity
			}

			canvas.addEventListener("pointermove", onPointerMove, { passive: false })
			canvas.addEventListener("pointerup", onPointerUp, { passive: false, once: true })
		}

		canvas.addEventListener("wheel", onWheel, { passive: false })
		canvas.addEventListener("pointerdown", onPointerDown, { passive: false })
		canvas.addEventListener("contextmenu", (event) => event.preventDefault(), { passive: false })
		canvas.addEventListener("touchstart", (event) => event.preventDefault(), { passive: false })
	}
}
