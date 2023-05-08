import { glue, GREY, use } from "../../../libraries/habitat-import.js"
import { Component } from "./component.js"

export const Style = class extends Component {
	name = "style"
	fill = use(GREY, { store: false })
	stroke = use("none", { store: false })
	strokeWidth = use(1)
	pointerEvents = use("all")
	visibility = use("visible")

	constructor() {
		super()
		glue(this)
	}

	apply() {
		const element = this.entity.svg.element
		this.use(() => element.setAttribute("fill", this.fill))
		this.use(() => element.setAttribute("stroke", this.stroke))
		this.use(() => element.setAttribute("stroke-width", this.strokeWidth))
		this.use(() => (element.style["pointer-events"] = this.pointerEvents))
		this.use(() => element.setAttribute("visibility", this.visibility))
	}

	onParent() {
		this.apply()
	}
}
