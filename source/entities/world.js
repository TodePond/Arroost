import { Box } from "./box.js"

export const World = class extends Box {
	constructor() {
		super()
		this.dimensions = [16, 12]
		this.transform.scale = [20, 20]
	}
}
