import { SVG } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { FULL, HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class Rectangle extends Entity {
	/**
	 * @param {{
	 * 	input?: Input
	 * }} options
	 */
	constructor({ input } = {}) {
		super()
		this.dom = this.attach(new Dom({ type: "svg", id: "rectangle", input }))
		this.dom.render = () => this.render()
	}

	render() {
		const element = SVG("rect")
		element.setAttribute("width", FULL)
		element.setAttribute("height", FULL)
		element.setAttribute("x", -HALF)
		element.setAttribute("y", -HALF)
		return element
	}
}
