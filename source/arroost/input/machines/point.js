import { State } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"

class Hovering extends State {
	pointerdown(e) {
		console.log(shared.hovering.input.get())
		return Pointing
	}
}

class Pointing extends State {
	pointerup() {
		return Hovering
	}
}

export const Point = Hovering
