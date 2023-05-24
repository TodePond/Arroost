import { WHITE, subtract } from "../../../../../libraries/habitat-import.js"
import { shared } from "../../../../main.js"
import { State } from "../../../input/state.js"
import { Idle } from "../../../input/states.js"
import { INNER_ATOM_UNIT, MAGNET_UNIT } from "../../../unit.js"
import { Curve } from "../../shapes/curve.js"
import { Flaps } from "../../shapes/flaps.js"
import { Carryable } from "../carryable.js"

export const ArrowTickler = class extends Carryable {
	tickle = new Curve()
	flaps = new Flaps()

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
			flaps.style.visibility = visibility
		})

		this.use((v) => {
			if (!this.isTickling()) return

			const displacement = subtract(pointer.position, this.transform.absolutePosition)
			const angle = Math.atan2(displacement.y, displacement.x) * (180 / Math.PI) - 45
			flaps.transform.rotation = angle

			tickle.target.transform.setAbsolutePosition(pointer.position)

			const relativeDisplacement = this.transform.getRelativePosition(pointer.position)
			const relativeDistance = Math.hypot(relativeDisplacement.x, relativeDisplacement.y)
			const relativeAngle = Math.atan2(relativeDisplacement.y, relativeDisplacement.x)

			const curveEndDistance = Math.max(0, relativeDistance - MAGNET_UNIT)
			const curveEnd = [
				Math.cos(relativeAngle) * curveEndDistance,
				Math.sin(relativeAngle) * curveEndDistance,
			]

			const curveStartDistance = Math.min(MAGNET_UNIT - INNER_ATOM_UNIT, curveEndDistance)
			const curveStart = [
				Math.cos(relativeAngle) * curveStartDistance,
				Math.sin(relativeAngle) * curveStartDistance,
			]

			tickle.curveEndTarget.transform.position = curveEnd
			tickle.curveStartTarget.transform.position = curveStart

			flaps.transform.setAbsolutePosition(pointer.position)
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
	cursor: "none",
})

export const Prodding = new State({
	name: "Prodding",
	cursor: "none",
})
