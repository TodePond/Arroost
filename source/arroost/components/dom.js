import { Component } from "./component.js"
import { Transform } from "./transform.js"
import { Entity } from "../entities/entity.js"

export class Dom extends Component {
	/** @returns {SVGElement | HTMLElement | null} */
	render = () => null

	/** @type {SVGElement | HTMLElement | null} */
	#container = null

	/** @type {SVGElement | HTMLElement | null} */
	#element = null

	/**
	 * @param {{
	 * 	transform?: Transform
	 * 	type?: "html" | "svg"
	 * }} options
	 */
	constructor({ transform = Transform.Root, type = "svg" } = {}) {
		super()
		this.transform = transform
		this.type = type
	}

	getElement() {
		if (this.#element) return this.#element
		const element = this.render()
		this.#element = element
		return element
	}

	getContainer() {
		if (this.#container) return this.#container

		const container =
			this.type === "svg"
				? document.createElementNS("http://www.w3.org/2000/svg", "svg")
				: document.createElement("div")
		container.style["position"] = "absolute"
		container.style["width"] = "1"
		container.style["height"] = "1"
		container.style["overflow"] = "visible"

		this.use(() => {
			const [x, y] = this.transform.absolutePosition.get()
			const [sx, sy] = this.transform.scale.get()
			container.style["transform"] = `translate(${x}px, ${y}px) scale(${sx}, ${sy})`
		})

		const element = this.getElement()
		if (element) container.append(element)

		this.#container = container
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
