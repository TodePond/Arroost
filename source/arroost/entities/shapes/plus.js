import { SVG } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { FULL, SIXTH, THIRD } from "../../unit.js"
import { Entity } from "../entity.js"

export class Plus extends Entity {
	/**
	 * @param {{
	 * 	input?: Input
	 * }} options
	 */
	constructor({ input } = {}) {
		super()
		this.dom = this.attach(new Dom({ type: "svg", id: "plus", input }))
		this.dom.render = () => this.render()
	}

	static WIDTH = THIRD
	static LENGTH = FULL

	render() {
		const element = SVG("polygon")
		const HALF_WIDTH = Plus.WIDTH / 2
		const HALF_LENGTH = Plus.LENGTH / 2
		const points = [
			[-HALF_WIDTH, -HALF_LENGTH],
			[HALF_WIDTH, -HALF_LENGTH],
			[HALF_WIDTH, -HALF_WIDTH],
			[HALF_LENGTH, -HALF_WIDTH],
			[HALF_LENGTH, HALF_WIDTH],
			[HALF_WIDTH, HALF_WIDTH],
			[HALF_WIDTH, HALF_LENGTH],
			[-HALF_WIDTH, HALF_LENGTH],
			[-HALF_WIDTH, HALF_WIDTH],
			[-HALF_LENGTH, HALF_WIDTH],
			[-HALF_LENGTH, -HALF_WIDTH],
			[-HALF_WIDTH, -HALF_WIDTH],
		]
		element.setAttribute("points", points.map((point) => point.join()).join(" "))
		return element
	}
}
