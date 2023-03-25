import { Component, Entity } from "../../libraries/habitat-import.js"
import { Movement } from "../components/movement.js"
import { Svg } from "../components/render.js"
import { Style } from "../components/style.js"

export const Thing = class extends Entity {
	constructor(components = []) {
		super([
			new Component.Transform(),
			new Component.Stage(),
			new Component.Rectangle(),
			new Style(),
			new Movement(),
			new Svg(),
			...components,
		])
	}

	render() {
		return undefined
	}

	add(child) {
		super.add(child)
		this.svg.element.append(child.svg.element)
	}

	delete(child) {
		super.delete(child)
		this.svg.element.removeChild(child.svg.element)
	}
}
