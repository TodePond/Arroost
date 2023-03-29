import { Thing } from "./thing.js"

export const Camera = class extends Thing {
	constructor(stage) {
		super()
		this.stage.connect(stage)
	}

	start({ background, html, svg, foreground }) {
		svg.append(this.svg.element)
		foreground.canvas.style["pointer-events"] = "none"
	}
}
