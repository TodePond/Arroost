import { t } from "../../nogan/nogan.js"
import { Component } from "./component.js"
import { shared } from "../../main.js"

export class Transform extends Component {
	/** @param {Transform | null} parent */
	constructor(parent = Transform.Root) {
		super()
		this.parent = parent
		this.position = this.use(t([0, 0]))
		this.scale = this.use(t([1, 1]))
		this.absolutePosition = this.use(() => this.getAbsolutePosition())
	}

	/** @returns {[number, number]} */
	getAbsolutePosition() {
		const [x, y] = this.position.get()
		const [px, py] = this.parent?.getAbsolutePosition() ?? [0, 0]
		return [x + px, y + py]
	}

	static Root = new Transform(null)
	static Inverse = class extends Transform {
		/** @returns {[number, number]} */
		getAbsolutePosition() {
			const [x, y] = this.position.get()
			const [px, py] = this.parent?.getAbsolutePosition() ?? [0, 0]
			return [x - px, y - py]
		}
	}
}
