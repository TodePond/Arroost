import { HTML } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Entity } from "../entity.js"

export class TextInput extends Entity {
	constructor() {
		super()
		this.dom = this.attach(new Dom({ type: "html", id: "text-input" }))
		this.dom.render = () => this.render()

		// this.dom.style.fill.set("none")
		this.dom.style.color.set("white")

		const container = this.dom.getContainer()
		container.style.width = "100vw"
		container.style.height = "100vh"
	}

	render() {
		const element = HTML("input")

		return element
	}
}
