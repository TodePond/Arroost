import { HTML, SVG } from "../../../../libraries/habitat-import.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { FULL, HALF } from "../../unit.js"
import { Entity } from "../entity.js"

export class TextHtml extends Entity {
	constructor() {
		super()
		this.dom = this.attach(new Dom({ type: "html", id: "text-html" }))
		this.dom.render = () => this.render()

		this.dom.style.fill.set("none")
		this.dom.style.color.set("white")
		this.dom.style.fontSize.set(40)

		const container = this.dom.getContainer()
		container.style.textAlign = "center"
		container.style.display = "flex"
		container.style.justifyContent = "center"
		container.style.alignItems = "center"
		// container.style.fontWeight = "lighter"
		container.style.position = "absolute"
		container.style.left = "-50vw"
		container.style.top = "-50vh"
		container.style.width = "100vw"
		container.style.height = "100vh"
	}

	value = this.use("")

	render() {
		const element = HTML("span")
		this.use(() => {
			element.textContent = this.value.get()
		}, [this.value])

		addEventListener(
			"pointerdown",
			() => {
				this.dispose()
			},
			{ once: true },
		)

		return element
	}
}
