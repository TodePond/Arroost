import { Component } from "./component.js"
import { Transform } from "./transform.js"
import { Style } from "./style.js"
import { shared } from "../../main.js"
import { Input } from "./input.js"
import { c, t } from "../../nogan/nogan.js"
import { distanceBetween } from "../../../libraries/habitat-import.js"
import { FULL } from "../unit.js"

export class Dom extends Component {
	/** @returns {SVGElement | HTMLElement | null} */
	render = () => null

	/** @type {SVGElement | HTMLElement | null} */
	#container = null

	/** @type {SVGElement | HTMLElement | null} */
	#element = null

	/**
	 * @param {{
	 * 	id: string
	 * 	transform?: Transform
	 * 	type?: "html" | "svg"
	 * 	position?: [number, number]
	 * 	style?: Style
	 * 	input?: Input
	 * }} options
	 */
	constructor({
		id,
		type = "html",
		position = c([0, 0]),
		transform = new Transform({ position }),
		style = new Style(),
		input,
	}) {
		super()
		this.id = id
		this.transform = transform
		this.type = type
		this.style = style
		this.input = input ?? shared.scene?.input

		this.cullBoundsToCorner = this.use(() => {
			const [x, y] = this.cullBounds.get() ?? [0, 0]
			return distanceBetween([0, 0], [x, y])
		})
	}

	getElement() {
		if (this.#element) return this.#element
		const element = this.render()
		this.#element = element
		if (element) {
			element.setAttribute("class", `${this.id}${this.id ? "-" : ""}element`)
			element.style["draggable"] = "false"
			this.type === "svg"
				? // @ts-expect-error - can't be bothered to get it to figure out the types here
				  this.style.applySvgElement(element)
				: // @ts-expect-error
				  this.style.applyHtmlElement(element)

			element["input"] = this.input
		}
		return element
	}

	outOfView = this.use(false)

	/** @type {Signal<[number, number] | null>} */
	cullBounds = this.use(null)

	getContainer() {
		if (this.#container) return this.#container

		const container =
			this.type === "svg"
				? document.createElementNS("http://www.w3.org/2000/svg", "svg")
				: document.createElement("div")
		container.style["position"] = "absolute"
		container.style["width"] = "1px"
		container.style["height"] = "1px"
		container.style["overflow"] = "visible"
		container.style["pointer-events"] = "none"
		container.style["draggable"] = "false"
		// container.style["box-sizing"] = "border-box"
		container.style["contain"] = "size layout style content"
		// container.style["transform-origin"] = "top left"
		// container.style["height"] = FULL + "px"
		// container.style["width"] = FULL + "px"

		container.setAttribute("class", `${this.id}${this.id ? "-" : ""}container`)

		this.use(
			() => {
				const [x, y] = this.transform.absolutePosition.get()
				const [sx, sy] = this.transform.scale.get()
				container.style["transform"] = `translate(${x}px, ${y}px) scale(${sx}, ${sy})`
			},
			{ parents: [this.transform.absolutePosition, this.transform.scale] },
		)

		this.use(
			() => {
				const cullbounds = this.cullBounds.get()
				if (cullbounds === null) return
				const [x, y] = this.transform.absolutePosition.get()

				const bounds = shared.scene?.bounds.get() ?? {
					left: -Infinity,
					top: -Infinity,
					right: Infinity,
					bottom: Infinity,
					center: 0,
				}

				const screenCenter = bounds.center
				const distance = distanceBetween(screenCenter, [x, y])
				if (distance > bounds.centerToCorner + this.cullBoundsToCorner.get()) {
					if (this.outOfView.get()) return
					this.outOfView.set(true)
					return
				}

				if (distance < bounds.centerToEdge) {
					if (!this.outOfView.get()) return
					this.outOfView.set(false)
					return
				}

				const screenLeft = bounds.left
				const screenTop = bounds.top
				const screenRight = bounds.right
				const screenBottom = bounds.bottom

				const left = x - cullbounds.x
				const top = y - cullbounds.y
				const right = x + cullbounds.x
				const bottom = y + cullbounds.y

				const outOfView =
					right < screenLeft || left > screenRight || bottom < screenTop || top > screenBottom

				// if (outOfView === this.outOfView.get()) return
				this.outOfView.set(outOfView)
			},
			{
				parents: [this.transform.absolutePosition, shared.scene?.bounds],
			},
		)

		this.use(
			() => {
				const outOfView = this.outOfView.get()
				container.style["display"] = outOfView ? "none" : "block"
			},
			{
				parents: [this.outOfView],
			},
		)

		const element = this.getElement()
		if (element) container.append(element)

		this.#container = container
		this.style.applyContainer(container)
		return container
	}

	/**
	 * @param {Dom} dom
	 * @returns {SVGElement | HTMLElement}
	 */
	append(dom) {
		const container = dom.getContainer()
		this.getContainer().append(container)
		return container
	}

	dispose() {
		super.dispose()
		if (this._container) {
			this._container.remove()
			this._container = null
		}
	}
}
