import { HTML, SVG } from "../../../../libraries/habitat-import.js"
import { c, t } from "../../../nogan/nogan.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { FULL, HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class RectangleHtml extends Entity {
	dimensions = this.use(t([FULL, FULL]))

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
			const [width, height] = this.dimensions.get()
			element.style.height = height + "px"
			element.style.top = -height / 2 + "px"
			element.style.width = width + "px"
		}, [this.dimensions])

		return element
	}
}
