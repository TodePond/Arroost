import { GREY, SVG } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { Bounds } from "../../components/bounds.js"
import { Dom } from "../../components/dom.js"
import { Transform } from "../../components/transform.js"
import { HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class Ellipse extends Entity {
	constructor() {
		super()
		this.dom = this.attach(new Dom({ type: "svg", id: "ellipse" }))
		this.dom.render = () => this.render()
	}

	render() {
		const element = SVG("ellipse")
		element.setAttribute("rx", HALF)
		return element
	}
}
