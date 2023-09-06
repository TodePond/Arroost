import { glue, GREY, use } from "../../../libraries/habitat-import.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"

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

	static SHADOW = "0px 4px 8px rgba(0, 0, 0, 0.25), 0px 0px 4px rgba(0, 0, 0, 0.15)"
	static SHADOW_FILTER =
		"drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.25)) drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.15))"

	/**
	 * @param {SVGElement} element
	 */
	applySvgElement(element) {
		this.use(() => element.setAttribute("fill", this.fill.get().toString()))
		this.use(() => element.setAttribute("stroke", this.stroke.get().toString()))
		this.use(() => element.setAttribute("stroke-width", this.strokeWidth.get().toString()))
		this.use(() => (element.style["pointer-events"] = this.pointerEvents.get()))
		this.use(() => {
			if (!this.shadow.get()) return
			console.warn(
				"You are applying a shadow to an SVG element.",
				"This is quite slow.",
				"Consider changing the element type to HTML :)",
			)
			element.style.filter = this.shadow.get() ? Style.SHADOW_FILTER : "none"
		})
	}

	/**
	 * @param {SVGElement} element
	 */
	applyHtmlElement(element) {
		this.use(() => (element.style["background-color"] = this.fill.get().toString()))
		this.use(() => (element.style["pointer-events"] = this.pointerEvents.get()))
		this.use(() => {
			const hasStroke = this.stroke.get() !== "none" && this.strokeWidth.get() !== 0
			const hasShadow = this.shadow.get()
			if (!hasStroke && !hasShadow) {
				return
			}
			const shadow = hasShadow ? Style.SHADOW : ""
			const stroke = hasStroke
				? `inset 0 0 0 ${this.strokeWidth.get()}px ${this.stroke.get()}`
				: ""

			const divider = hasShadow && hasStroke ? ", " : ""
			element.style["box-shadow"] = shadow + divider + stroke ?? "none"
		})
	}

	/**
	 * @param {HTMLElement | SVGElement} container
	 */
	applyContainer(container) {
		this.use(() => container.setAttribute("visibility", this.visibility.get()))
		this.use(() => (container.style["z-index"] = this.zIndex.get()))
		this.use(() => (container.style["cursor"] = this.cursor.get()))
		this.use(() => (container.style.filter = this.shadow.get() ? Style.SHADOW : "none"))

		this.use(() => {
			this.shadowElement = this.attach(new Dom({ id: "shadow" }))
			container.style["box-shadow"] = this.shadow.get() ? Style.SHADOW : "none"
		})
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
