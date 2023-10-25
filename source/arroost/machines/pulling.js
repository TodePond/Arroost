import { use } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Input } from "../components/input.js"
import { InputState } from "./input-state.js"
// import {  } from "./input.js"
import { Targeting } from "./targeting.js"

export class Pulling extends InputState {
	name = "pulling"

	/**
	 * @param {Input} [input]
	 * @param {Input | null} [target]
	 */
	constructor(input, target) {
		super(input)
		this.target = target ?? this.input
		this.target.highlighted.set(true)
		this.updateHoverTarget()
	}

	pointerdown() {
		return new Targeting({ input: this.input, target: this.target })
	}

	pointerover() {
		this.updateHoverTarget()
	}

	updateHoverTarget() {
		const oldTarget = this.target
		const newTarget = shared.hovering.input.get()
		if (oldTarget === newTarget) return
		oldTarget.highlighted.set(false)
		this.target = newTarget
		newTarget.highlighted.set(true)
	}
}
