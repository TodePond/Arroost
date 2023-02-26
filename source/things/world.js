import { Thing } from "./thing.js"

export const World = class extends Thing {
	dimensions = [100, 100]
	things = new Set()

	draw(layers, time) {
		for (const thing of this.things) {
			if (!thing.started) {
				thing.start(layers, time)
			}
			thing.draw(layers, time)
		}
	}
}
