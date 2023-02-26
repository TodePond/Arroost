import { add, clamp, scale, subtract } from "../../libraries/habitat-import.js"
import { shared } from "../shared.js"

export const Camera = class {
	// Public properties
	pan = [0, 0]
	panVelocity = [0, 0]
	zoom = 1.0

	ZOOM_SPEED = 0.02
	PAN_FRICTION = 0.9
	PAN_MIN_SPEED = 0.1

	draw(layers) {
		const [context, html] = layers

		context.clearRect(0, 0, context.canvas.width, context.canvas.height)
		context.save()
		context.translate(...shared.camera.pan)
		context.scale(shared.camera.zoom, shared.camera.zoom)

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

			const isTrackPad = true //TODO
			if (isTrackPad) {
				const isPinch = event.ctrlKey //TODO: improve this
				if (isPinch) return onPinch(event)
				return onTwoFingerPan(event)
			}

			return onMouseWheel()
		}

		const onPinch = (event) => {
			const previousZoom = this.zoom
			this.zoom -= event.deltaY * this.ZOOM_SPEED
			this.zoom = clamp(this.zoom, 0.1, 10.0)

			// Adjust pan to keep the same point under the cursor
			const zoomScale = this.zoom / previousZoom
			const cursor = [event.clientX, event.clientY]
			const offset = subtract(this.pan, cursor)
			const scaledOffset = scale(offset, zoomScale)
			this.pan = add(cursor, scaledOffset)
		}

		const onTwoFingerPan = (event) => {
			this.pan = subtract(this.pan, [event.deltaX, event.deltaY])
		}

		const onMouseWheel = (event) => {}

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
