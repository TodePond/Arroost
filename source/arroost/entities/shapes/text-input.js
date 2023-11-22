import { HTML } from "../../../../libraries/habitat-import.js"
import { t } from "../../../nogan/nogan.js"
import { Dom } from "../../components/dom.js"
import { FULL } from "../../unit.js"
import { Entity } from "../entity.js"

export class TextInput extends Entity {
	constructor() {
		super()
		this.dom = this.attach(new Dom({ type: "html", id: "text-input" }))
		this.dom.render = () => this.render()

		// this.dom.style.fill.set("none")
		this.dom.style.color.set("white")
		this.dom.style.fill.set("transparent")
		this.dom.style.stroke.set("transparent")
		this.dom.style.strokeWidth.set(0)
		this.dom.style.pointerEvents.set("all")

		const container = this.dom.getContainer()
		container.style.width = "100vw"
		container.style.height = "100vh"
	}

	dimensions = this.use(t([FULL + "px", FULL + "px"]))

	render() {
		const element = HTML("input")
		this.use(() => {
			const [width, height] = this.dimensions.get()
			element.style.width = width
			element.style.height = height
		}, [this.dimensions])

		for (const eventName of this.events) {
			element.addEventListener(eventName, this.stopIt, { passive: false })
		}

		return element
	}

	dispose() {
		const element = this.dom.getElement()
		if (element) {
			for (const eventName of this.events) {
				element.removeEventListener(eventName, this.stopIt)
			}
		}
		super.dispose()
	}

	events = [
		"pointerdown",
		"pointermove",
		"pointerup",
		"touchstart",
		"touchmove",
		"touchend",
		"touchcancel",
		"mousedown",
		"mousemove",
		"mouseup",
		"keydown",
		"keyup",
		"keypress",
	]

	stopIt = (event) => event.stopPropagation()
}
