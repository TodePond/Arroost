import { t } from "../../nogan/nogan.js"
import { Component } from "./component.js"

export const Transform = class extends Component {
	position = this.use(t([0, 0]))
	scale = this.use(t([1, 1]))
	absolutePosition = this.use(() => this.getAbsolutePosition())

	/**
	 * @param {Transform | null} parent
	 */
	constructor(parent = null) {
		super()
		this.parent = parent
	}

	/**
	 * @returns {[number, number]}
	 */
	getAbsolutePosition() {
		const [x, y] = this.position.get()
		const [px, py] = this.parent?.getAbsolutePosition() ?? [0, 0]
		return [x + px, y + py]
	}
}
