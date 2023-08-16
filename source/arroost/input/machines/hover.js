import { Machine, State, use } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"

export const getHoverState = () => {
	return new State({
		input: use(shared.scene.input),
		pointerover(event) {
			const { input = shared.scene.input } = event
			const oldInput = this.input.get()
			if (oldInput === input) return
			this.input.set(input)
		},
	})
}
