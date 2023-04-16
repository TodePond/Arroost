import { BLACK, SVG, glue } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"
import { Thing } from "./thing.js"

export const Display = class extends Thing {
	constructor(stage) {
		super()
		glue(this)
		this.stage.connect(stage)
	}

	start({ background, html, svg, foreground }) {
		svg.append(this.svg.element)
		foreground.canvas.style["pointer-events"] = "none"
	}

	tick() {
		shared.time = performance.now()
	}

	render() {
		const rectangle = SVG(`<rect width="100%" height="100%" fill="${BLACK}" />`)
		return rectangle
	}
}
