import { glue, GREY, use, WHITE } from "../../libraries/habitat-import.js"
import { Component } from "./component.js"

export const Style = class extends Component {
	name = "style"
	fill = use(GREY, { store: false })
	stroke = use(WHITE, { store: false })
	strokeWidth = use(1)

	constructor() {
		super()
		glue(this)
	}
}
