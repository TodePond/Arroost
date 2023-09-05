import { Hovering, InputState } from "./input.js"

export class Targeting extends InputState {
	name = "targeting"

	pointerup(e) {
		if (e.previous.name === "targeting") {
			return new Hovering()
		}
	}
}
