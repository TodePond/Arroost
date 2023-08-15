import { BLUE, GREY, WHITE } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Style } from "../../components/style.js"
import { Transform } from "../../components/transform.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"

export class Dummy extends Entity {
	constructor() {
		super()
		this.dom = this.attach(new Dom({ id: "dummy", type: "html" }))
		this.ellipse = new Ellipse()
		this.dom.append(this.ellipse.dom)
	}
}
