import {
	add,
	distanceBetween,
	lerp,
	normalise,
	scale,
	subtract,
} from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Dragging } from "../input/machines/input.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"
import { Transform } from "./transform.js"
import { Movement } from "./movement.js"

export class Carry extends Component {
	/** @type {Input} */
	// @ts-ignore
	input = null

	/** @type {Transform} */
	// @ts-ignore
	transform = null

	/** @type {Movement} */
	// @ts-ignore
	movement = null

	/**
	 * @param {{
	 * 	input: Input
	 * 	transform: Transform
	 * 	movement?: Movement
	 * }} options
	 */
	constructor({ input, transform, movement }) {
		super()
		this.input = input
		this.transform = transform
		this.movement = movement ?? new Movement(transform)
		if (!movement) {
			this.movement.friction.set([0.9, 0.9])
		}

		const pointing = input.state("pointing")
		pointing.enter = this.onPointingEnter.bind(this)
		pointing.pointermove = this.onPointingPointerMove.bind(this)
		pointing.tick = this.onPointingTick.bind(this)

		const dragging = input.state("dragging")
		dragging.enter = this.onDraggingEnter.bind(this)
		dragging.pointermove = this.onDraggingPointerMove.bind(this)
		dragging.pointerup = this.onDraggingPointerUp.bind(this)
	}

	onPointingEnter(e) {
		// this.dom.bringToFront()
		const pointerStart = shared.pointer.transform.displacedPosition.get()
		const offset = subtract(pointerStart, this.transform.displacedPosition.get())
		e.state.pointerStart = pointerStart
		e.state.offset = offset

		const absolutePointerStart = shared.pointer.transform.absolutePosition.get()
		const absoluteOffset = subtract(absolutePointerStart, this.transform.absolutePosition.get())
		e.state.absoluteOffset = absoluteOffset
		e.state.absoluteStart = subtract(absolutePointerStart, absoluteOffset)
	}

	onPointingPointerDown(e) {
		const pointerPosition = shared.pointer.transform.absolutePosition.get()
		const position = subtract(pointerPosition, e.state.absoluteOffset)
		const dampened = lerp([e.state.absoluteStart, position], 0.5)
		this.transform.setAbsolutePosition(dampened)
	}

	onPointingPointerMove(e) {
		const pointerNow = shared.pointer.transform.displacedPosition.get()
		const distance = distanceBetween(e.state.pointerStart, pointerNow)
		if (distance < 5) {
			const pointerPosition = shared.pointer.transform.absolutePosition.get()
			const position = subtract(pointerPosition, e.state.absoluteOffset)
			const dampened = lerp([e.state.absoluteStart, position], 0.5)
			this.transform.setAbsolutePosition(dampened)
			return null
		}

		return new Dragging(this.input)
	}

	onPointingTick(e) {
		const pointerNow = shared.pointer.transform.displacedPosition.get()
		const offsetNow = subtract(pointerNow, this.transform.displacedPosition.get())
		const distance = distanceBetween(e.state.offset, offsetNow)
		if (distance >= 5) {
			const pointerPosition = shared.pointer.transform.absolutePosition.get()
			const position = subtract(pointerPosition, e.state.absoluteOffset)
			const dampened = lerp([e.state.absoluteStart, position], 0.5)
			this.transform.setAbsolutePosition(dampened)
			return new Dragging(this.input)
		}
	}

	onDraggingEnter(e) {
		this.movement.velocity.set([0, 0])
		e.state.absoluteOffset = e.previous.absoluteOffset
	}

	onDraggingPointerMove(e) {
		const pointerPosition = shared.pointer.transform.absolutePosition.get()
		const position = subtract(pointerPosition, e.state.absoluteOffset)
		this.transform.setAbsolutePosition(position)
	}

	onDraggingPointerUp(e) {
		const pointerVelocity = shared.pointer.movement.absoluteVelocity.get()
		this.movement.setAbsoluteVelocity(pointerVelocity)
	}
}
