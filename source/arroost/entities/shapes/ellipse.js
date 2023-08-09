import { GREY, SVG } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { Bounds } from "../../components/bounds.js"
import { Dom } from "../../components/dom.js"
import { Transform } from "../../components/transform.js"
import { HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class Ellipse extends Entity {
	/** @param {Transform} parent */
	constructor(parent = Transform.Root, colour = GREY) {
		super()
		this.colour = colour
		this.transform = this.attach(new Transform(parent))
		this.dom = this.attach(new Dom({ transform: this.transform, type: "svg" }))

		this.dom.render = this.render.bind(this)
	}

	render() {
		const element = SVG("ellipse")
		element.setAttribute("rx", HALF)
		element.setAttribute("fill", this.colour.toString())
		return element
	}
}
