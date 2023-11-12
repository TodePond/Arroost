import { HTML } from "../../../libraries/habitat-import.js"
import { Dom } from "../components/dom.js"
import { Entity } from "./entity.js"
import { TextHtml } from "./shapes/text-html.js"

export class Title extends Entity {
	constructor() {
		super()
		this.dom = this.attach(new Dom({ type: "html", id: "title" }))

		this.heading = this.attach(new TextHtml())
		this.heading.value.set("normalise sharing scrappy fiddles")
		this.heading.dom.style.fontFamily.set("Rosario")
		this.heading.dom.style.fontSize.set(40)
		this.heading.dom.style.fontWeight.set("lighter")

		this.dom.append(this.heading.dom)

		document.body.style.cursor = "pointer"

		const element = this.heading.dom.getElement()
		if (!element) return
		element.style.animation = "fade-in 5s ease-in forwards"

		addEventListener("pointerdown", () => this.dispose(), { once: true })
	}

	dispose() {
		document.body.style.cursor = "default"
		super.dispose()
	}
}
