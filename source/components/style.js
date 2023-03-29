import { glue, GREY, use, WHITE } from "../../libraries/habitat-import.js"
import { DisposableComponent } from "./disposable.js"

export const Style = class extends DisposableComponent {
	name = "style"
	fill = use(GREY, { store: false })
	stroke = use(WHITE, { store: false })

	constructor() {
		super()
		glue(this)
	}
}
