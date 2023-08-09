import { Cell } from "../cell.js"
import { Carryable } from "./carryable.js"

export const Dummy = class extends Carryable {
	constructor(child = true) {
		const cell = new Cell()
		super([cell])

		this.style.fill = this.use(() => cell.foreground.value)

		// if (child) {
		// 	this.child = new Dummy(false)
		// 	this.add(this.child)
		// 	this.child.transform.position.x = 100
		// 	this.child.transform.position.y = 100
		// }
	}
}
