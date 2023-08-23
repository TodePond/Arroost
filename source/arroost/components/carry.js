import { distanceBetween, subtract } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"

export class Carry extends Component {
	/** @type {Input} */
	// @ts-ignore
	input = null

	/** @type {Dom} */
	// @ts-ignore
	dom = null

	/**
	 * @param {{
	 * 	input: Input
	 * 	dom: Dom
	 * }} options
	 */
	addEvents({ input, dom }) {
		this.input = input
		this.dom = dom

		const pointing = input.state("pointing")
		pointing.enter = this.onPointingEnter.bind(this)
		pointing.pointermove = this.onPointingPointerMove.bind(this)
		pointing.tick = this.onPointingTick.bind(this)

		const dragging = input.state("dragging")
		// dragging.enter = this.onDraggingEnter.bind(this)
		// dragging.pointermove = this.onDraggingPointerMove.bind(this)
		// dragging.pointerup = this.onDraggingPointerUp.bind(this)
	}

	onPointingEnter(e) {
		// this.dom.bringToFront()
		const pointerStart = shared.pointer.transform.displacedPosition.get()
		// const offset = subtract(pointerStart, this.dom.transform.displacedPosition.get())
		e.state.pointerStart = pointerStart
	}

	onPointingPointerMove(e) {
		const pointerNow = shared.pointer.transform.displacedPosition.get()
		const distance = distanceBetween(e.state.pointerStart, pointerNow)
		if (distance < 10) {
			return null
		}
	}

	onPointingTick(e) {
		// if offset is too big, grab it!
	}
}
