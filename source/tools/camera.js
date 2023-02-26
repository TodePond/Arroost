import { add, clamp, scale, subtract } from "../../libraries/habitat-import.js"
import { shared } from "../shared.js"

export const Camera = class {
	position = [0, 0]
	positionChanged = false
	panVelocity = [0, 0]
	zoom = 1.0

	ZOOM_SPEED = 0.02
	MIN_ZOOM = 0.1
	MAX_ZOOM = 10.0
	PAN_FRICTION = 0.9
	PAN_MIN_SPEED = 0.1

	draw(stage) {
		for (const layer of stage.layers) {
			const { context } = layer
			switch (layer.type) {
				case "2d":
					this.draw2D(context)
					continue
				case "html":
					this.drawHTML(context)
					continue
			}
		}
	}

	drawHTML(context) {
		if (this.positionChanged) {
			this.positionChanged = false
			context.style["transform"] = `translate(${this.position.x}px, ${this.position.y}px)`
		}

		shared.world.drawHTML(context)
	}

	draw2D(context) {
		context.clearRect(0, 0, context.canvas.width, context.canvas.height)
		context.save()
		context.translate(...shared.camera.position)
		context.scale(shared.camera.zoom, shared.camera.zoom)

		shared.world.draw2D(context)

		context.restore()
	}

	tick() {
		if (!shared.pointer.down) {
			const panSpeed = Math.hypot(...this.panVelocity)
			if (panSpeed < this.PAN_MIN_SPEED) {
				this.panVelocity = [0, 0]
			} else {
				this.pan(this.panVelocity)
				this.panVelocity = scale(this.panVelocity, this.PAN_FRICTION)
			}
		}
	}

	pan(displacement) {
		this.positionChanged = true
		this.position = add(this.position, displacement)
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
			this.zoom = clamp(this.zoom, this.MIN_ZOOM, this.MAX_ZOOM)

			// Adjust pan to keep the same point under the cursor
			const zoomScale = this.zoom / previousZoom
			const cursor = [event.clientX, event.clientY]
			const offset = subtract(this.position, cursor)
			const scaledOffset = scale(offset, zoomScale)
			this.position = add(cursor, scaledOffset)
			this.positionChanged = true
		}

		const onTwoFingerPan = (event) => {
			this.pan([-event.deltaX, -event.deltaY])
		}

		const onMouseWheel = (event) => {}

		const onPointerDown = (event) => {
			event.preventDefault()
			canvas.setPointerCapture(event.pointerId)

			const start = [event.clientX, event.clientY]
			const offset = subtract(this.position, start)

			const onPointerMove = (event) => {
				event.preventDefault()
				const end = [event.clientX, event.clientY]
				this.position = add(end, offset)
				this.positionChanged = true
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
