import { Component, GREY, use, WHITE } from "../../libraries/habitat-import.js"

export const Style = class extends Component {
	name = "style"
	fill = use(GREY, { store: false })
	stroke = use(WHITE, { store: false })
}
