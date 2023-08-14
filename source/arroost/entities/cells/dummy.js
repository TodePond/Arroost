import { BLUE, GREY, WHITE } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Transform } from "../../components/transform.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"

export class Dummy extends Entity {
	constructor() {
		super()
		this.transform = this.attach(new Transform())
		this.dom = this.attach(new Dom({ transform: this.transform, type: "html" }))

		const ellipse = new Ellipse(undefined)
		this.transform.scale.set([0.1, 0.1])
		this.dom.append(ellipse.dom)

		this.listen("tick", (e) => {
			const [sx, sy] = this.transform.scale.get()
			this.transform.scale.set([sx + 0.01, sy + 0.01])
			// this.transform.position.set([x + 1, y + 1])
		})
	}
}
