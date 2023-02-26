import { HTML } from "../../libraries/habitat-import.js"
import { Thing } from "./thing.js"

export const HTMLThing = class extends Thing {
	element = this.render()

	start(context) {}

	render() {
		return HTML("<div>HTML Thing</div>")
	}
}
