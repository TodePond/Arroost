import { WHITE, equals } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Dom } from "../components/dom.js"
import { Entity } from "./entity.js"
import { Ellipse } from "./shapes/ellipse.js"

export class Ghost extends Entity {
	constructor() {
		super()
		this.dom = this.attach(new Dom({ id: "ghost", type: "svg" }))

		this.ellipse = new Ellipse()
		this.dom.append(this.ellipse.dom)

		this.dom.transform.scale.set([1 / 2, 1 / 2])
		this.ellipse.dom.style.fill.set("none")
		this.ellipse.dom.style.stroke.set(WHITE.toString())
		this.ellipse.dom.style.pointerEvents.set("none")
		this.ellipse.dom.style.visibility.set("hidden")

		let started = false
		this.listen("tick", () => {
			if (!started) {
				if (equals(shared.pointer.transform.position.get(), [0, 0])) {
					return
				} else {
					this.ellipse.dom.style.visibility.set("visible")
					started = true
				}
			}
			this.dom.transform.position.set(shared.pointer.transform.absolutePosition.get())
		})
	}
}
