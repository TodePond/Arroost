import { GREY, WHITE, angleBetween, glue, subtract } from "../../../../libraries/habitat-import.js"
import { INNER_ATOM_UNIT, MAGNET_UNIT } from "../../../arroost/unit.js"
import { shared } from "../../../main.js"
import { Cell } from "../../cell.js"
import { Curve } from "../../shapes/curve.js"
import { State } from "../../state.js"
import { Dragging, Idle } from "../../states.js"
import { Carryable } from "../carryable.js"

export const ArrowTickler = class extends Carryable {
	tickle = new Curve({ flaps: true, debug: false })
	isStartAngleDecided = this.use(false)
	isPulsing = this.use(false)

	constructor(options, components = []) {
		const cell = new Cell(options)
		super([cell, ...components])
		glue(this)
	}

	render() {
		const { pointer } = shared
		const { tickle } = this
		this.add(tickle)

		this.style.stroke = "none"

		tickle.style.pointerEvents = "none"

		// Indicator
		tickle.style.stroke = WHITE
		tickle.style.strokeWidth = INNER_ATOM_UNIT
		tickle.extra = INNER_ATOM_UNIT
		this.use(() => {
			const visibility = this.isTickling() ? "visible" : "hidden"
			tickle.style.visibility = visibility
		})

		this.use(() => {
			if (this.isPulsing) {
				this.style.fill = WHITE
			} else {
				this.style.fill = GREY
			}
		})

		this.use(() => {
			this.style.fill = this.cell.background.value
		})

		this.use((v) => {
			if (!this.isTickling()) return

			const displacement = subtract(pointer.position, this.transform.absolutePosition)
			//const angle = Math.atan2(displacement.y, displacement.x) * (180 / Math.PI) - 45

			tickle.target.transform.setAbsolutePosition(pointer.position)

			const relativePointerPosition = this.transform.getRelativePosition(pointer.position)
			const relativeDistance = Math.hypot(relativePointerPosition.x, relativePointerPosition.y)

			//tickle.endAngle = angleBetween([0, 0], displacement)

			if (!this.isStartAngleDecided) {
				tickle.startAngle = angleBetween(displacement, [0, 0])

				if (relativeDistance >= MAGNET_UNIT * 2) {
					this.isStartAngleDecided = true
					tickle.decided = true
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

	onPointingPointerDown() {
		if (this.isPulsing) return Dragging
	}

	onPointingPointerUp() {
		return Tickling
	}

	onTicklingEnter() {
		this.bringToFront()
		this.isStartAngleDecided = false
		this.tickle.decided = false
	}

	onTicklingPointerDown(event, state) {
		//return Prodding
		const result = this.onTickle(event, state)
		if (result === undefined) {
			return Idle
		}
		return result
	}

	onProddingPointerUp(event, state) {
		// const result = this.onTickle(event, state)
		// if (result === undefined) {
		// 	return Idle
		// }
		// return result
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
	cursor: "crosshair",
})
