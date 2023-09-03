import { Hovering, InputState } from "./input.js"

export class Pulling extends InputState {
	name = "pulling"

	pointerup(e) {
		if (e.previous.name === "pulling") {
			return new Hovering()
		}
	}
}
