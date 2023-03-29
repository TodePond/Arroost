import { Component } from "../../libraries/habitat-import.js"
import { Input } from "../components/input.js"
import { Movement } from "../components/movement.js"
import { Style } from "../components/style.js"
import { Svg } from "../components/svg.js"
import { DisposableEntity } from "./disposable.js"

export const Thing = class extends DisposableEntity {
	// Add any children in the constructor
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
	}

	// Control appearance in the render method
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
