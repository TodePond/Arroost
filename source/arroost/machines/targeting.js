import { Hovering, InputState } from "./input.js"

export class Targeting extends InputState {
	name = "targeting"

	pointerup() {
		return new Hovering()
	}
}
