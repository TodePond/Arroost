import { glue, GREY, use } from "../../../libraries/habitat-import.js"
import { Component } from "./component.js"

export const Style = class extends Component {
	name = "style"
	fill = this.use(GREY, { store: false })
	stroke = this.use("none", { store: false })
	strokeWidth = this.use(1)
	pointerEvents = this.use("all")
	visibility = this.use("visible")
	zIndex = this.use(0)

	/**
	 * @param {HTMLElement | SVGElement} element
	 */
	applyElement(element) {
		this.use(() => element.setAttribute("fill", this.fill.get().toString()))
		this.use(() => element.setAttribute("stroke", this.stroke.get().toString()))
		this.use(() => element.setAttribute("stroke-width", this.strokeWidth.get().toString()))
		this.use(() => (element.style["pointer-events"] = this.pointerEvents.get()))
	}

	/**
	 * @param {HTMLElement | SVGElement} container
	 */
	applyContainer(container) {
		this.use(() => container.setAttribute("visibility", this.visibility.get()))
		this.use(() => (container.style["z-index"] = this.zIndex.get()))
	}
}
