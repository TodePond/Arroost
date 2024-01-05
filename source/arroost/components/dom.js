import { Component } from "./component.js"
import { Transform } from "./transform.js"
import { Style } from "./style.js"
import { shared } from "../../main.js"
import { Input } from "./input.js"
import { c, t } from "../../nogan/nogan.js"
import { distanceBetween } from "../../../libraries/habitat-import.js"
import { FULL, HALF } from "../unit.js"

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
	 * 	cullBounds?: [number, number] | null
	 * 	fixed?: boolean
	 * }} options
	 */
	constructor({
		id,
		type = "html",
		position = c([0, 0]),
		transform = new Transform({ position }),
		style = new Style(),
		input,
		cullBounds = null,
	}) {
		super()
		this.id = id
		this.transform = transform
		this.type = type
		this.style = style
		this.input = input ?? shared.scene?.input
		this.cullBounds = this.use(cullBounds)
	}

	getElement() {
		if (this.#element) return this.#element
		const element = this.render()
		this.#element = element
		if (element) {
			element.setAttribute("class", `${this.id}${this.id ? "-" : ""}element`)
			element.setAttribute("draggable", "false")
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
	forceInView = this.use(false)

	getContainer() {
		if (this.#container) return this.#container

		const container =
			this.type === "svg"
				? document.createElementNS("http://www.w3.org/2000/svg", "svg")
				: document.createElement("div")

		container.setAttribute("class", `${this.id}${this.id ? "-" : ""}container dom-container`)

		// this.use(() => {
		// 	const [x, y] = this.transform.absolutePosition.get()
		// 	// @ts-expect-error - more performant if I just pass a number
		// 	// container.style.left = x.toString() + "px"
		// 	// @ts-expect-error
		// 	// container.style.top = y
		// }, [this.transform.absolutePosition])

		this.use(() => {
			const [sx, sy] = this.transform.scale.get()
			const [x, y] = this.transform.absolutePosition.get()
			const rotation = this.transform.rotation.get()
			let transform = ""
			if (x !== 0 || y !== 0) transform += `translate(${x}px,${y}px)`
			if (sx !== 1 || sy !== 1) transform += ` scale(${sx}, ${sy})`
			if (rotation !== 0) transform += ` rotate(${rotation}rad)`
			if (transform !== "") container.style.transform = transform
		}, [this.transform.scale, this.transform.absolutePosition, this.transform.rotation])

		const cullBounds = this.cullBounds.get()
		if (cullBounds) {
			const [cullX, cullY] = cullBounds
			this.use(() => {
				const [x, y] = this.transform.absolutePosition.get()

				const bounds = shared.scene.bounds.get()
				if (!this.outOfView.get()) {
					const xPlacement = x - bounds.left
					if (xPlacement <= -cullX) {
						this.outOfView.set(true)
						return
					}

					const yPlacement = y - bounds.top
					if (yPlacement <= -cullY) {
						this.outOfView.set(true)
						return
					}

					if (xPlacement >= bounds.width + cullX) {
						this.outOfView.set(true)

						return
					}

					if (yPlacement >= bounds.height + cullY) {
						this.outOfView.set(true)
						return
					}
				} else {
					const xPlacement = x - bounds.left
					if (xPlacement <= -cullX) {
						return
					}

					const yPlacement = y - bounds.top
					if (yPlacement <= -cullY) {
						return
					}

					if (xPlacement >= bounds.width + cullX) {
						return
					}

					if (yPlacement >= bounds.height + cullY) {
						return
					}

					this.outOfView.set(false)
				}
			}, [this.transform.absolutePosition, shared.scene.bounds])
		}

		this.use(() => {
			const outOfView = this.outOfView.get()
			container.style.display = outOfView ? "hidden" : "block"
		}, [this.outOfView, this.forceInView])

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

	clear() {
		this.getContainer().innerHTML = ""
	}

	dispose() {
		super.dispose()
		if (this.#container) {
			this.#container.remove()
			this.#container = null
		}
	}
}
