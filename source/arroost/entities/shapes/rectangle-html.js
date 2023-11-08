import { HTML, SVG } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { FULL, HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class RectangleHtml extends Entity {
	width = this.use(FULL)
	height = this.use(FULL)

	/**
	 * @param {{
	 * 	input?: Input
	 * }} options
	 */
	constructor({ input } = {}) {
		super()
		this.dom = this.attach(new Dom({ type: "html", id: "rectangle-html", input }))
		this.dom.render = () => this.render()
	}

	render() {
		const element = HTML("div")
		element.style["position"] = "relative"

		this.use(() => {
			element.style.width = this.width.get() + "px"
		}, [this.width])

		this.use(() => {
			const height = this.height.get()
			element.style.height = height + "px"
			element.style.top = -height / 2 + "px"
		}, [this.height])

		return element
	}
}
