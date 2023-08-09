import { Component } from "./component.js"
import { Transform } from "./transform.js"
import { Entity } from "../entities/entity.js"

export class Dom extends Component {
	/** @returns {SVGElement | HTMLElement | null} */
	render = () => null

	/** @type {SVGElement | HTMLElement | null} */
	_container = null

	/**
	 * @param {{
	 * 	transform?: Transform
	 * 	type?: "div" | "svg"
	 * }} options
	 */
	constructor({ transform = Transform.Root, type = "svg" } = {}) {
		super()
		this.transform = transform
		this.type = type
	}

	getContainer() {
		if (this._container) return this._container

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

		const element = this.render()
		if (element) container.append(element)

		this._container = container
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
}
