import { Component, glue } from "../../libraries/habitat-import.js"
import { Input } from "../components/input.js"
import { Movement } from "../components/movement.js"
import { Style } from "../components/style.js"
import { Svg } from "../components/svg.js"
import { Entity } from "./entity.js"

export const Thing = class extends Entity {
	ghost = this.use(false)

	constructor(components = []) {
		super([
			new Component.Transform(),
			new Component.Stage(),
			new Component.Rectangle([0, 0]),
			new Style(),
			new Movement(),
			new Svg(),
			new Input(),
			...components,
		])

		glue(this)
	}

	render() {
		return undefined
	}

	add(child) {
		super.add(child)
		if (child.ghost) return
		this.svg.element.append(child.svg.element)
	}

	delete(child) {
		super.delete(child)
		if (child.ghost) return
		this.svg.element.removeChild(child.svg.element)
	}

	bringToFront() {
		const { parent, svg } = this
		if (parent === undefined) return
		parent.svg.element.removeChild(svg.element)
		parent.svg.element.append(svg.element)
	}

	sendToBack() {
		const { parent, svg } = this
		if (parent === undefined) return
		parent.svg.element.removeChild(svg.element)
		parent.svg.element.prepend(svg.element)
	}
}
