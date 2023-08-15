import { BLUE, GREY, SILVER, WHITE } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Style } from "../../components/style.js"
import { Transform } from "../../components/transform.js"
import { THIRD } from "../../unit.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"

export class Dummy extends Entity {
	constructor() {
		super()
		this.dom = this.attach(new Dom({ id: "dummy", type: "html" }))
		this.back = new Ellipse()
		this.front = new Ellipse()

		this.back.dom.transform.scale.set([2 / 3, 2 / 3])

		this.front.dom.transform.scale.set([1 / 3, 1 / 3])
		this.front.dom.style.fill.set(SILVER)

		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)
	}
}
