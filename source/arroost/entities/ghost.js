import { Component, SVG } from "../../../libraries/habitat-import.js"
import { Input } from "../components/input.js"
import { Movement } from "../components/movement.js"
import { Style } from "../components/style.js"
import { Svg } from "../components/svg.js"
import { Thing } from "./thing.js"

export const Ghost = class extends Thing {
	constructor(debug = false) {
		super([
			new Component.Transform(),
			new Component.Stage(),
			new Component.Rectangle([0, 0]),
			new Style(),
			new Movement(),
			new Svg(),
			new Input(),
		])

		this.ghost = true
		this.debug = debug
		if (debug) {
			this.style.pointerEvents = "none"
			this.render = () => {
				const dot = SVG("circle")
				dot.setAttribute("cx", 0)
				dot.setAttribute("cy", 0)
				dot.setAttribute("r", 1)
				dot.setAttribute("fill", "red")
				return dot
			}
		}
	}
}
