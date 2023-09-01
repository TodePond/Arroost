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
import { Style } from "./style.js"

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

	/** @type {Style} */
	// @ts-ignore
	style = null

	/**
	 * @param {{
	 * 	input: Input
	 * 	dom: Dom
	 * 	movement?: Movement
	 * }} options
	 */
	constructor({ input, dom, movement }) {
		super()
		this.input = input
		this.transform = dom.transform
		this.style = dom.style
		this.movement = movement ?? new Movement({ transform: this.transform })
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
		this.style.bringToFront()
		const pointerStart = shared.pointer.transform.displacedPosition.get()
		const offset = subtract(pointerStart, this.transform.displacedPosition.get())
		e.state.pointerStart = pointerStart
		e.state.offset = offset

		const absolutePointerStart = shared.pointer.transform.absolutePosition.get()
		const absoluteOffset = subtract(absolutePointerStart, this.transform.absolutePosition.get())
		e.state.absoluteOffset = absoluteOffset
		e.state.absoluteStart = subtract(absolutePointerStart, absoluteOffset)

		e.state.scenePointerStart = shared.pointer.transform.position.get()
		e.state.sceneStart = shared.scene.dom.transform.position.get()
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

		if (e.state.button === 2) {
			const dragging = new Dragging(shared.scene.input)
			dragging.pointerStart = e.state.scenePointerStart
			dragging.start = e.state.sceneStart
			this.transform.setAbsolutePosition(e.state.absoluteStart)
			return dragging
		}
		return new Dragging(this.input)
	}

	onPointingTick(e) {
		const pointerNow = shared.pointer.transform.displacedPosition.get()
		const offsetNow = subtract(pointerNow, this.transform.displacedPosition.get())
		const distance = distanceBetween(e.state.offset, offsetNow)
		if (distance >= 5) {
			if (e.state.button === 2) {
				const dragging = new Dragging(shared.scene.input)
				dragging.pointerStart = e.state.scenePointerStart
				dragging.start = e.state.sceneStart
				this.transform.setAbsolutePosition(e.state.absoluteStart)
				return dragging
			}

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
