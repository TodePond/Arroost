import { RED, WHITE } from "../../../../libraries/habitat-import.js"
import { Rectangle } from "../shapes/rectangle.js"

export class Marker extends Rectangle {
	constructor() {
		super()
		this.dom.transform.position.set([innerWidth / 2, innerHeight / 2])
		this.dom.style.fill.set("transparent")
		this.dom.style.stroke.set(WHITE.toString())
		this.dom.style.strokeWidth.set(5)
		this.dom.transform.scale.set([0.2, 0.2])
	}
}
