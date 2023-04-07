import { glue, use } from "../../libraries/habitat-import.js"
import { Component } from "./component.js"

export const Input = class extends Component {
	name = "input"
	hovered = use(false)
	pointed = use(false)
	dragged = use(false)

	static events = new Set(["onPoint", "onRelease", "onGrab", "onDrag", "onDrop"])

	constructor() {
		super()
		glue(this)
	}

	fire(name, args) {
		if (!Input.events.has(name)) {
			throw new Error(`Couldn't find event '${name}' in list of approved events.`)
		}

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
