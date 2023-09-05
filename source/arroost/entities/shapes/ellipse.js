import { SVG } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
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
		element.setAttribute("cx", HALF)
		element.setAttribute("cy", HALF)
		return element
	}
}
