import { State, use } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"

class Hovering extends State {
	input = use(shared.scene.input)
	pointerover(event) {
		const { input = shared.scene.input } = event.target
		const oldInput = this.input.get()
		if (oldInput === input) return
		this.input.set(input)
	}
}

export const Hover = Hovering
