import { useSignal, WHITE } from "../../libraries/habitat-import.js"

export const Thing = class {
	position = useSignal([0, 0])
	dimensions = useSignal([10, 10])
	colour = useSignal(WHITE)

	constructor(options = {}) {
		Object.assign(this, options)
	}

	start(context) {}
	draw(context) {}
}
