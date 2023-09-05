import { glue, GREY, use } from "../../../libraries/habitat-import.js"
import { Component } from "./component.js"

export const Style = class extends Component {
	static highestZIndex = 0
	static lowestZIndex = 0

	name = "style"
	fill = this.use(GREY.toString(), { store: false })
	stroke = this.use("none", { store: false })
	strokeWidth = this.use(1)
	cursor = this.use("default")
	shadow = this.use(false)

	/** @type {Signal<"none" | "all" | "inherit">} */
	pointerEvents = this.use("inherit")

	/** @type {Signal<"hidden" | "visible" | "inherit">} */
	visibility = this.use("inherit")

	zIndex = this.use(0)

	/**
	 * @param {HTMLElement | SVGElement} element
	 */
	applyElement(element) {
		this.use(() => element.setAttribute("fill", this.fill.get().toString()))
		this.use(() => element.setAttribute("stroke", this.stroke.get().toString()))
		this.use(() => element.setAttribute("stroke-width", this.strokeWidth.get().toString()))
		this.use(() => (element.style["pointer-events"] = this.pointerEvents.get()))

		// this.use(
		// 	() =>
		// 		(element.style.filter = this.shadow.get()
		// 			? "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.25)) drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.15))"
		// 			: "none"),
		// )

		// element.style["content-visibility"] = "auto"
	}

	/**
	 * @param {HTMLElement | SVGElement} container
	 */
	applyContainer(container) {
		this.use(() => container.setAttribute("visibility", this.visibility.get()))
		this.use(() => (container.style["z-index"] = this.zIndex.get()))
		this.use(() => (container.style["cursor"] = this.cursor.get()))
		this.use(
			() =>
				(container.style["box-shadow"] = this.shadow.get()
					? "0px 4px 8px rgba(0, 0, 0, 0.25)"
					: "none"),
		)
		container.style["border-radius"] = "100%"
	}

	/**
	 * Bring to front
	 */
	bringToFront() {
		const zIndex = ++Style.highestZIndex
		this.zIndex.set(zIndex)
	}

	/**
	 * Send to back
	 */
	sendToBack() {
		const zIndex = --Style.lowestZIndex
		this.zIndex.set(zIndex)
	}
}
