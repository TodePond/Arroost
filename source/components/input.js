import { glue, use } from "../../libraries/habitat-import.js"
import { DisposableComponent } from "./disposable.js"

export const Input = class extends DisposableComponent {
	name = "input"
	hovered = use(false)
	constructor() {
		super()
		glue(this)
	}

	fire(name, args) {
		const { entity } = this
		if (entity === undefined) {
			return
		}

		const method = entity[name]
		if (method === undefined) {
			return
		}

		return method.apply(entity, args)
	}
}
