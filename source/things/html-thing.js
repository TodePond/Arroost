import { HTML, useEffect } from "../../libraries/habitat-import.js"
import { Thing } from "./thing.js"

export const HTMLThing = class extends Thing {
	element = this.render()

	start(context) {
		const container = HTML("<div></div>")
		container.style["position"] = "absolute"

		useEffect(() => {
			const position = this.position.get()
			const [x, y] = position
			container.style["left"] = `${x}px`
			container.style["top"] = `${y}px`
		})

		container.append(this.element)
		context.append(container)
	}

	render() {
		return HTML("<div>HTML Thing</div>")
	}
}
