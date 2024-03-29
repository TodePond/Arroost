import { SVG } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { FULL, HALF } from "../../unit.js"
import { Entity } from "../entity.js"
import { Plus } from "./plus.js"

export class Triangle extends Entity {
	/**
	 * @param {{
	 * 	input?: Input
	 * }} options
	 */
	constructor({ input } = {}) {
		super()
		this.dom = this.attach(new Dom({ type: "svg", id: "triangle", input }))
		this.dom.render = () => this.render()
	}

	static WIDTH = FULL
	static HEIGHT = Math.sqrt(FULL ** 2 - HALF ** 2)

	render() {
		const element = SVG("polygon")
		const OFFSET = FULL - Triangle.HEIGHT
		const HALF_WIDTH = Triangle.WIDTH / 2
		const HALF_HEIGHT = Triangle.HEIGHT / 2
		const points = [
			[-HALF_WIDTH, -HALF_HEIGHT + OFFSET],
			[HALF_WIDTH, -HALF_HEIGHT + OFFSET],
			[0, HALF_HEIGHT + OFFSET],
		]
		element.setAttribute("points", points.map((point) => point.join()).join(" "))
		return element
	}
}
