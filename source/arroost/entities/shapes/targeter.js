import { SVG, WHITE } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { c, t } from "../../../nogan/nogan.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { Transform } from "../../components/transform.js"
import { QUARTER, THIRD } from "../../unit.js"
import { Entity } from "../entity.js"

export class Targeter extends Entity {
	/**
	 * @param {{
	 * 	input?: Input
	 * }} options
	 */
	constructor({ input } = {}) {
		super()
		this.dom = this.attach(new Dom({ type: "svg", id: "line", input }))
		this.target = this.attach(new Transform({ parent: this.dom.transform }))
		this.dom.style.stroke.set(WHITE.toString())
		this.dom.style.strokeWidth.set(QUARTER)
		this.dom.style.strokeLineCap.set("butt")
		this.dom.render = () => this.render()
	}

	render() {
		const element = SVG("line")

		this.use(() => {
			const end = this.target.position.get()
			element.setAttribute("x2", end.x)
			element.setAttribute("y2", end.y)
		}, [this.target.position])

		return element
	}
}
