import { Hovering, InputState } from "./input.js"
import { Targeting } from "./targeting.js"

export class Pulling extends InputState {
	name = "pulling"

	pointerdown() {
		return new Targeting(this.input)
	}
}
