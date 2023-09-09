import { Hovering, InputState } from "./input.js"

export class Targeting extends InputState {
	name = "targeting"

	constructor({ input, target }) {
		super(input)
		this.target = target
	}

	pointerup() {
		this.target.highlighted.set(false)
		return new Hovering()
	}
}
