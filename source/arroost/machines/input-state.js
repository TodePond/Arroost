import { State } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Input } from "../components/input.js"

export class InputState extends State {
	name = "input-state"

	/** @param {Input} [input] */
	constructor(input) {
		super()
		this.input = input ?? shared.hovering.input.get()
	}

	enter() {
		this.input.state(this.name).active.set(true)
		this.input.current.set(this)
	}

	exit() {
		this.input.state(this.name).active.set(false)
	}

	fire(eventName, arg) {
		// We call events in order from most specific to least specific
		const inputStateMethod = this.input.state(this.name)[eventName]
		const inputMethod = this.input[eventName]
		const stateMethod = this[eventName]
		const inputStateResult = inputStateMethod?.call(this, arg)
		if (inputStateResult !== undefined) return inputStateResult
		const inputResult = inputMethod?.call(this, arg)
		if (inputResult !== undefined) return inputResult
		return stateMethod?.call(this, arg)
	}
}
