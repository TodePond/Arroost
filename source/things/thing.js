import { WHITE } from "../../libraries/habitat-import.js"
import { set, use } from "../utilities/signal.js"

export const Thing = class {
	position = use([0, 0])
	dimensions = use([10, 10])
	colour = use(WHITE)

	constructor(options = {}) {
		set(this, options)
	}

	start(context) {}
	draw(context) {}
	update(context) {}
}
