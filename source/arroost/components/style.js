import { glue, GREY, use } from "../../../libraries/habitat-import.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"

export const Style = class extends Component {
	static highestZIndex = 0
	static lowestZIndex = 0

	name = "style"

	/** @type {Signal<string | null>} */
	fill = this.use(null)

	stroke = this.use("none", { store: false })
	strokeWidth = this.use(1)
	cursor = this.use("default")
	shadow = this.use(false)
	color = this.use("black")
	fontFamily = this.use("Rosario")
	fontSize = this.use(16)

	/** @type {Signal<"none" | "all" | "inherit">} */
	pointerEvents = this.use("inherit")

	/** @type {Signal<"hidden" | "visible" | "inherit">} */
	visibility = this.use("inherit")

	/** @type {Signal<"butt" | "round" | "square">} */
	strokeLineCap = this.use("butt")

	zIndex = this.use(0)

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
	}

	/**
	 * @param {HTMLElement | SVGElement} container
	 */
	applyContainer(container) {
		this.useAttribute(container, "visibility", this.visibility)
		this.useStyle(container, "z-index", this.zIndex)
		this.useStyle(container, "cursor", this.cursor)
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

	/**
	 * @param {SVGElement | HTMLElement} element
	 * @param {string} attribute
	 * @param {Signal<string | boolean | number | null>} signal
	 * @param {(value: string | boolean | number) => string} transform
	 * @param {Signal<any>[]} dependencies
	 */
	useAttribute(
		element,
		attribute,
		signal,
		transform = (value) => value.toString(),
		dependencies = [signal],
	) {
		this.use(() => {
			const value = signal.get()
			if (value === null) {
				element.removeAttribute(attribute)
				return
			}

			element.setAttribute(attribute, transform(value))
		}, dependencies)
	}

	/**
	 * @param {HTMLElement | SVGElement} element
	 * @param {string} style
	 * @param {Signal<string | boolean | number | null>} signal
	 * @param {(value: string | boolean | number) => string} transform
	 * @param {Signal<any>[]} dependencies
	 */
	useStyle(
		element,
		style,
		signal,
		transform = (value) => value.toString(),
		dependencies = [signal],
	) {
		this.use(() => {
			const value = signal.get()
			if (value === null) {
				element.style.removeProperty(style)
				return
			}

			element.style.setProperty(style, transform(value))
		}, dependencies)
	}
}
