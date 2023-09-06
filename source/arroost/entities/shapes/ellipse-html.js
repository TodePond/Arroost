import { HTML, SVG } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { FULL, HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class EllipseHtml extends Entity {
	/**
	 * @param {{
	 * 	input?: Input
	 * }} options
	 */
	constructor({ input } = {}) {
		super()
		this.dom = this.attach(new Dom({ type: "html", id: "ellipse-html", input }))
		this.dom.render = () => this.render()
	}

	render() {
		const element = HTML("div")
		element.style["border-radius"] = "100%"
		element.style["position"] = "relative"
		element.style["left"] = -HALF
		element.style["top"] = -HALF
		element.style["width"] = FULL
		element.style["height"] = FULL
		return element
	}
}
