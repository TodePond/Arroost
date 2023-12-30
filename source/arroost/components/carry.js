import {
	add,
	distanceBetween,
	lerp,
	normalise,
	scale,
	subtract,
} from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Dragging } from "../machines/input.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"
import { Transform } from "./transform.js"
import { Movement } from "./movement.js"
import { Style } from "./style.js"
import { c, t } from "../../nogan/nogan.js"
import { Tunnel } from "./tunnel.js"

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
	 * 	constrain?: [boolean, boolean]
	 * 	raise?: boolean
	 * }} options
	 */
	constructor({ input, dom, movement, constrain = [false, false], raise = true }) {
		super()
		this.input = input
		this.dom = dom
		this.transform = dom.transform
		this.style = dom.style
		this.constrain = constrain
		this.raise = raise
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
		if (this.raise) this.style.bringToFront()
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
		this.setAbsolutePosition(dampened)
	}

	onPointingPointerMove(e) {
		const pointerNow = shared.pointer.transform.displacedPosition.get()
		const distance = distanceBetween(e.state.pointerStart, pointerNow)
		if (distance < 5) {
			const pointerPosition = shared.pointer.transform.absolutePosition.get()
			const position = subtract(pointerPosition, e.state.absoluteOffset)
			const dampened = lerp([e.state.absoluteStart, position], 0.5)
			this.setAbsolutePosition(dampened)
			return null
		}

		if (e.state.button === 2 || (e.state.button === 0 && e.ctrlKey)) {
			const dragging = new Dragging(shared.scene.input)
			dragging.pointerStart = e.state.scenePointerStart
			dragging.start = e.state.sceneStart
			this.setAbsolutePosition(e.state.absoluteStart)
			return dragging
		}
		return new Dragging(this.input)
	}

	/** @param {[number, number]} position */
	setAbsolutePosition(position) {
		const currentPosition = this.transform.absolutePosition.get()
		const constrainedPosition = t([
			this.constrain.x ? currentPosition.x : position.x,
			this.constrain.y ? currentPosition.y : position.y,
		])
		this.transform.setAbsolutePosition(constrainedPosition)
	}

	/** @param {[number, number]} velocity */
	setAbsoluteVelocity(velocity) {
		const constrainedVelocity = t([
			this.constrain.x ? 0 : velocity.x,
			this.constrain.y ? 0 : velocity.y,
		])
		this.movement.setAbsoluteVelocity(constrainedVelocity)
	}

	onPointingTick(e) {
		const pointerNow = shared.pointer.transform.displacedPosition.get()
		const offsetNow = subtract(pointerNow, this.transform.displacedPosition.get())
		const distance = distanceBetween(e.state.offset, offsetNow)
		if (distance >= 5) {
			if (e.state.button === 2 || (e.state.button === 0 && e.ctrlKey)) {
				const dragging = new Dragging(shared.scene.input)
				dragging.pointerStart = e.state.scenePointerStart
				dragging.start = e.state.sceneStart
				this.setAbsolutePosition(e.state.absoluteStart)
				return dragging
			}

			const pointerPosition = shared.pointer.transform.absolutePosition.get()
			const position = subtract(pointerPosition, e.state.absoluteOffset)
			const dampened = lerp([e.state.absoluteStart, position], 0.5)
			this.setAbsolutePosition(dampened)
			shared.scene.shouldDealWithInfinites = true
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
		this.setAbsolutePosition(position)
		shared.scene.shouldDealWithInfinites = true
		// Tunnel.get(1)?.entity["dom"].transform.getAbsolutePosition().d
	}

	onDraggingPointerUp(e) {
		const pointerVelocity = shared.pointer.movement.absoluteVelocity.get()
		this.setAbsoluteVelocity(pointerVelocity)
	}
}
