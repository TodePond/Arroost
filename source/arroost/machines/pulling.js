import { use } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Input } from "../components/input.js"
import { Hovering, InputState } from "./input.js"
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
	}

	pointerdown() {
		return new Targeting({ input: this.input, target: this.target })
	}

	pointerover() {
		const oldTarget = this.target
		const newTarget = shared.hovering.input.get()
		if (oldTarget === newTarget) return
		oldTarget.highlighted.set(false)
		this.target = newTarget
		newTarget.highlighted.set(true)
	}
}
