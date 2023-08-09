import { glue } from "../../libraries/habitat-import.js"
import { Component } from "../arroost/components/component.js"

export const Input = class extends Component {
	name = "input"
	state = this.use(null, { store: false })

	Idle = this.use(true)
	Pointing = this.use(false)
	Dragging = this.use(false)
	Hovering = this.use(false)

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
