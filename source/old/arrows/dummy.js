import { BLUE, WHITE } from "../../../libraries/habitat-import.js"
import { Dom } from "../../arroost/components/dom.js"
import { Transform } from "../../arroost/components/transform.js"
import { Entity } from "../../arroost/entities/entity.js"

export class Dummy extends Entity {
	constructor() {
		super()
		this.transform = this.attach(new Transform())
		this.dom = this.attach(new Dom({ transform: this.transform, type: "div" }))
		this.dom.render = () => {
			const div = document.createElement("input")
			div.style["width"] = "200px"
			div.style["height"] = "50px"
			div.style["background-color"] = BLUE
			div.style["display"] = "flex"
			div.style["justify-content"] = "center"
			div.style["align-items"] = "center"
			div.style["position"] = "relative"
			div.style["border-radius"] = "50%"
			div.style["left"] = "-100px"
			div.style["top"] = "-25px"
			div.style["text-align"] = "center"
			div.style["color"] = WHITE.toString()
			div.textContent = "Ribbit"
			return div
		}
	}
}
