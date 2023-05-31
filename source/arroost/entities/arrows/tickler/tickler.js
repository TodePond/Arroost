import { WHITE, angleBetween, glue, subtract } from "../../../../../libraries/habitat-import.js"
import { shared } from "../../../../main.js"
import { State } from "../../../input/state.js"
import { Idle } from "../../../input/states.js"
import { INNER_ATOM_UNIT, MAGNET_UNIT } from "../../../unit.js"
import { Curve } from "../../shapes/curve.js"
import { Flaps } from "../../shapes/flaps.js"
import { Carryable } from "../carryable.js"

export const ArrowTickler = class extends Carryable {
	tickle = new Curve()
	isStartAngleDecided = this.use(false)
	flaps = new Flaps()

	constructor(...args) {
		super(...args)
		glue(this)
	}

	render() {
		const { pointer } = shared
		const { tickle, flaps } = this
		this.add(tickle)
		this.add(flaps)

		this.style.stroke = "none"

		tickle.style.pointerEvents = "none"
		flaps.style.pointerEvents = "none"

		// Indicator
		tickle.style.stroke = WHITE
		tickle.style.strokeWidth = INNER_ATOM_UNIT
		tickle.extra = INNER_ATOM_UNIT
		flaps.style.stroke = WHITE
		flaps.style.fill = "none"
		flaps.style.strokeWidth = INNER_ATOM_UNIT
		this.use(() => {
			const visibility = this.isTickling() ? "visible" : "hidden"
			tickle.style.visibility = visibility
			flaps.style.visibility = "hidden"
		})

		this.use((v) => {
			if (!this.isTickling()) return

			const displacement = subtract(pointer.position, this.transform.absolutePosition)
			const angle = Math.atan2(displacement.y, displacement.x) * (180 / Math.PI) - 45
			flaps.transform.rotation = angle

			tickle.target.transform.setAbsolutePosition(pointer.position)
			flaps.transform.setAbsolutePosition(pointer.position)

			const relativePointerPosition = this.transform.getRelativePosition(pointer.position)
			const relativeDistance = Math.hypot(relativePointerPosition.x, relativePointerPosition.y)

			//tickle.endAngle = angleBetween([0, 0], displacement)

			if (!this.isStartAngleDecided) {
				tickle.startAngle = angleBetween(displacement, [0, 0])

				if (relativeDistance >= MAGNET_UNIT * 2) {
					this.isStartAngleDecided = true
					this.tickle.debug = true
				}
			}
		})

		tickle.target.transform.position = [0, 0]

		return super.render()
	}

	tick() {
		this.movement.applyFriction()
		this.movement.update()
	}

	isTickling() {
		return this.input.state === Tickling || this.input.state === Prodding
	}

	onPointingPointerUp() {
		return Tickling
	}

	onTicklingEnter() {
		this.bringToFront()
		this.isStartAngleDecided = false
	}

	onTicklingPointerDown(event, state) {
		return Prodding
	}

	onProddingPointerUp(event, state) {
		const result = this.onTickle(event, state)
		if (result === undefined) {
			return Idle
		}
		return result
	}

	onTickle(event, state) {
		// Override this
	}
}

export const Tickling = new State({
	name: "Tickling",
	cursor: "crosshair",
})

export const Prodding = new State({
	name: "Prodding",
	cursor: "none",
})
