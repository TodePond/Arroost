import { glue, GREY, use } from "../../../libraries/habitat-import.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"

export const Style = class extends Component {
	static highestZIndex = 0
	static lowestZIndex = 0

	name = "style"

	/** @type {Signal<string | null>} */
	fill = this.use(null)

	/** @type {Signal<string | null>} */
	stroke = this.use(null)

	/** @type {Signal<number | null>} */
	strokeWidth = this.use(null)

	/** @type {Signal<null | string>} */
	cursor = this.use(null)

	/** @type {Signal<boolean | null>} */
	shadow = this.use(null)

	/** @type {Signal<string | null>} */
	color = this.use(null)

	/** @type {Signal<string | null>} */
	fontFamily = this.use(null)

	/** @type {Signal<number | null>} */
	fontSize = this.use(null)

	/** @type {Signal<string | number | null>} */
	fontWeight = this.use(null)

	/** @type {Signal<null | "none" | "all" | "inherit">} */
	pointerEvents = this.use(null)

	/** @type {Signal<null | "hidden" | "visible" | "inherit">} */
	visibility = this.use(null)

	/** @type {Signal<"butt" | "round" | "square" | null>} */
	strokeLineCap = this.use(null)

	/** @type {Signal<number | null>} */
	zIndex = this.use(null)

	/** @type {Signal<null | "relative" | "absolute" | "fixed" | "sticky">} */
	position = this.use(null)

	static SHADOW = "0px 4px 8px rgba(0, 0, 0, 0.25), 0px 0px 4px rgba(0, 0, 0, 0.15)"
	static SHADOW_FILTER =
		"drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.25)) drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.15))"

	/**
	 * @param {SVGElement} element
	 */
	applySvgElement(element) {
		this.useAttribute(element, "fill", this.fill)
		this.useAttribute(element, "stroke", this.stroke)
		this.useAttribute(element, "stroke-width", this.strokeWidth)
		this.useAttribute(element, "stroke-linecap", this.strokeLineCap)
		this.useStyle(element, "pointer-events", this.pointerEvents)
		this.useStyle(element, "filter", this.shadow, (value) => {
			console.warn(
				"You are applying a shadow to an SVG element.",
				"This is quite slow.",
				"Consider changing the element type to HTML :)",
			)
			return value ? Style.SHADOW : "none"
		})
	}

	/**
	 * @param {HTMLElement} element
	 */
	applyHtmlElement(element) {
		this.useStyle(element, "background-color", this.fill)
		this.useStyle(element, "pointer-events", this.pointerEvents)
		this.useStyle(element, "color", this.color)
		this.useStyle(element, "font-family", this.fontFamily)
		this.useStyle(element, "font-size", this.fontSize, (value) => value + "px")
		this.useStyle(element, "font-weight", this.fontWeight)
		this.useStyle(
			element,
			"box-shadow",
			this.shadow,
			(value) => {
				const hasStroke = this.stroke.get() !== "none" && this.strokeWidth.get() !== 0
				const hasShadow = value

				const shadow = hasShadow ? Style.SHADOW : ""
				const stroke = hasStroke
					? `inset 0 0 0 ${this.strokeWidth.get()}px ${this.stroke.get()}`
					: ""

				const divider = hasShadow && hasStroke ? ", " : ""
				return shadow + divider + stroke ?? "none"
			},
			[this.stroke, this.strokeWidth, this.shadow],
		)
		this.useStyle(element, "border-color", this.stroke)
		this.useStyle(element, "border-width", this.strokeWidth, (value) => value + "px")
	}

	/**
	 * @param {HTMLElement | SVGElement} container
	 */
	applyContainer(container) {
		this.useStyle(container, "visibility", this.visibility)
		this.useStyle(container, "z-index", this.zIndex)
		this.useStyle(container, "cursor", this.cursor)
		this.useStyle(container, "position", this.position)
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
