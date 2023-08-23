import { State } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { Input } from "../../components/input.js"
import { setCursor } from "../cursor.js"

export class InputState extends State {
	/** @type {Input} */
	input = shared.hovering.input.get()

	name = "point-state"
	cursor = "default"

	/** @param {Input} [input] */
	constructor(input) {
		super()
		if (input) this.input = input
	}

	enter() {
		this.input.state(this.name).active.set(true)
		this.input.current.set(this)
		setCursor(this.cursor)
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

export class Hovering extends InputState {
	name = "hovering"
	cursor = "pointer"

	enter() {
		super.enter()
		if (this.input.entity === shared.scene) {
			setCursor("default")
		}
	}

	pointerover() {
		if (this.input === shared.hovering.input.get()) return
		return new Hovering()
	}

	pointerdown() {
		return new Pointing(this.input)
	}

	keydown({ key }) {
		if (key.toLowerCase() === "d") {
			return new Debugging()
		}
	}
}

export class Pointing extends InputState {
	name = "pointing"
	cursor = "pointer"

	pointerup() {
		return new Hovering()
	}

	pointermove() {
		return new Dragging()
	}
}

export class Dragging extends InputState {
	name = "dragging"
	cursor = "grabbing"

	pointerup() {
		return new Hovering()
	}
}

export class Debugging extends InputState {
	name = "debugging"
	cursor = "help"

	keyup({ key }) {
		if (key.toLowerCase() === "d") {
			return new Hovering()
		}
	}

	pointerdown() {
		print(shared.hovering.input.get().entity)
	}
}

export const InputMachine = Hovering
