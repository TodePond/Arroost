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
		this.transform.scale.set([1, 1])
		this.dom.append(ellipse.dom)
	}
}
