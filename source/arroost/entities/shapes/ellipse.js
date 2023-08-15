import { GREY, SVG } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { Bounds } from "../../components/bounds.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { Transform } from "../../components/transform.js"
import { HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class Ellipse extends Entity {
	/**
	 * @param {{
	 * 	input?: Input
	 * }} options
	 */
	constructor({ input } = {}) {
		super()
		this.dom = this.attach(new Dom({ type: "svg", id: "ellipse", input }))
		this.dom.render = () => this.render()
	}

	render() {
		const element = SVG("ellipse")
		element.setAttribute("rx", HALF)
		return element
	}
}
