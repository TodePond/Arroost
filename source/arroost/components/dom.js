import { Component } from "./component.js"
import { Transform } from "./transform.js"
import { Style } from "./style.js"
import { shared } from "../../main.js"
import { Input } from "./input.js"

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
	 * 	type: "html" | "svg"
	 * 	style?: Style
	 * 	input?: Input
	 * }} options
	 */
	constructor({ id, type, transform = new Transform(), style = new Style(), input }) {
		super()
		this.id = id
		this.transform = transform
		this.type = type
		this.style = style
		this.input = input ?? shared.scene?.input
	}

	getElement() {
		if (this.#element) return this.#element
		const element = this.render()
		this.#element = element
		if (element) {
			element.setAttribute("class", `${this.id}${this.id ? "-" : ""}element`)
			this.style.applyElement(element)
			element["input"] = this.input
		}
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
		container.setAttribute("class", `${this.id}${this.id ? "-" : ""}container`)

		this.use(() => {
			const [x, y] = this.transform.absolutePosition.get()
			const [sx, sy] = this.transform.scale.get()
			container.style["transform"] = `translate(${x}px, ${y}px) scale(${sx}, ${sy})`
		})

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
