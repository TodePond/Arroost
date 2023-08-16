import { State } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { Input } from "../../components/input.js"
import { setCursor } from "../cursor.js"

class PointState extends State {
	/** @type {Input} */
	input = shared.hovering.input.get()

	name = "point-state"

	/** @param {Input} [input] */
	constructor(input) {
		super()
		if (input) this.input = input
	}

	enter() {
		this.input[this.name].set(true)
	}

	exit() {
		this.input[this.name].set(false)
	}

	fire(eventName, arg) {
		const stateMethod = this[eventName]
		const inputMethod = this.input[eventName]
		if (!inputMethod) {
			return stateMethod?.call(this, arg)
		}

		arg["default"] = () => stateMethod?.call(this, arg)
		return inputMethod.call(this.input, arg)
	}
}

class Hovering extends PointState {
	name = "hovering"
	enter() {
		super.enter()
		if (this.input.entity === shared.scene) {
			setCursor("default")
		} else {
			setCursor("pointer")
		}
	}

	pointerover() {
		if (this.input === shared.hovering.input.get()) return
		return new Hovering()
	}

	pointerdown() {
		return new Pointing(this.input)
	}
}

class Pointing extends PointState {
	name = "pointing"
	enter() {
		super.enter()
		setCursor("crosshair")
	}

	pointerup() {
		return new Hovering()
	}
}

export const Point = Hovering
