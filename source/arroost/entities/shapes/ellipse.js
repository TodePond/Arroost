import { GREY, SVG } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { Bounds } from "../../components/bounds.js"
import { Svg } from "../../components/svg.js"
import { Transform } from "../../components/transform.js"
import { HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class Ellipse extends Entity {
	/** @param {Transform} parent */
	constructor(parent = shared.scene.transform) {
		super()
		this.transform = this.attach(new Transform(parent))
		this.bounds = this.attach(new Bounds(this.transform))
		this.svg = this.attach(new Svg(this.transform, this.bounds))

		this.svg.render = this.render.bind(this)
	}

	render() {
		const element = SVG("ellipse")
		this.use(() => element.setAttribute("rx", this.bounds.dimensionsAbsolute.get()[0] / 2))
		element.setAttribute("fill", GREY)
		return element
	}
}
