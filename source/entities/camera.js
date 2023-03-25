import { Thing } from "./thing.js"

export const Camera = class extends Thing {
	constructor(stage) {
		super()
		this.stage.connect(stage)
	}

	start({ svg }) {
		svg.append(this.svg.element)
	}
}
