import { State } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { Input } from "../../components/input.js"
import { triggerRightClickPity } from "../wheel.js"

export class InputState extends State {
	/** @type {Input} */
	input = shared.hovering.input.get()

	name = "point-state"

	/** @param {Input} [input] */
	constructor(input) {
		super()
		if (input) this.input = input
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

export class Hovering extends InputState {
	name = "hovering"

	enter() {
		super.enter()
	}

	pointerover() {
		if (this.input === shared.hovering.input.get()) return
		return new Hovering()
	}

	pointerdown() {
		return new Pointing(this.input)
	}

	keydown({ key }) {
		switch (key.toLowerCase()) {
			case "d": {
				return new Debugging()
			}
			case " ": {
				return new Handing()
			}
		}
	}
}

export class Handing extends InputState {
	name = "handing"

	pointerdown() {
		return new Dragging(shared.scene.input)
	}

	keyup({ key }) {
		if (key.toLowerCase() === " ") {
			return new Hovering()
		}
	}
}

export class Pointing extends InputState {
	name = "pointing"
	cursor = "pointer"

	pointerup() {
		return new Hovering()
	}

	pointerdown(e) {
		this.button = e.button
	}

	pointermove() {
		return new Dragging()
	}
}

export class Dragging extends InputState {
	name = "dragging"
	cursor = "grabbing"

	pointerup(e) {
		if (e.button === 2) {
			triggerRightClickPity()
		}
		if (shared.keyboard[" "]) {
			return new Handing()
		}
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

	pointerdown(e) {
		if (e.ctrlKey || e.metaKey) {
			print(shared.hovering.input.get())
		} else {
			print(shared.hovering.input.get().entity)
		}
	}
}

export const InputMachine = Hovering
