import { Component } from "./component.js"
import { Transform } from "./transform.js"
import { Bounds } from "./bounds.js"

export const Svg = class extends Component {
	/** @returns {SVGElement | null} */
	render = () => null

	/** @type {SVGElement | null} */
	_container = null

	/**
	 * @param {Transform} transform
	 * @param {Bounds} bounds
	 */
	constructor(transform, bounds) {
		super()
		this.transform = transform
		this.bounds = bounds
	}

	getContainer() {
		if (this._container) return this._container

		const container = document.createElementNS("http://www.w3.org/2000/svg", "svg")
		container.style["width"] = "1"
		container.style["height"] = "1"
		container.style["overflow"] = "visible"

		this.use(() => {
			const [x, y] = this.transform.absolutePosition.get()
			const [sx, sy] = this.transform.scale.get()
			container.setAttribute("transform", `translate(${x}, ${y}) scale(${sx}, ${sy})`)
		})

		const element = this.render()
		if (element) container.append(element)

		this._container = container
		return container
	}
}
