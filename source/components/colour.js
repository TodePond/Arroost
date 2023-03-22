import { Component, GREY, use } from "../../libraries/habitat-import.js"

export const Style = class extends Component {
	name = "style"
	fill = use(GREY, { store: false })
}
