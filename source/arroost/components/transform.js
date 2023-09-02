import { t } from "../../nogan/nogan.js"
import { Component } from "./component.js"
import { shared } from "../../main.js"
import { equals } from "../../../libraries/habitat-import.js"

export class Transform extends Component {
	/** @param {Transform | null} parent */
	constructor(parent = Transform.Root) {
		super()
		this.parent = parent

		this.position = this.use(t([0, 0]), { eq: equals })
		this.scale = this.use(t([1, 1]), { eq: equals })

		this.absolutePosition = this.use(() => this.getAbsolutePosition(), { eq: equals })
		this.displacedPosition = this.use(() => this.getDisplacedPosition(), { eq: equals })
	}

	/** @returns {[number, number]} */
	getDisplacedPosition() {
		const [x, y] = this.position.get()
		const [px, py] = this.parent?.displacedPosition.get() ?? [0, 0]
		return [x + px, y + py]
	}

	/** @returns {[number, number]} */
	getAbsolutePosition() {
		const [x, y] = this.position.get()
		const [px, py] = this.parent?.absolutePosition.get() ?? [0, 0]
		const [spx, spy] = this.parent?.scale.get() ?? [1, 1]
		return [x * spx + px, y * spy + py]
	}

	/** @param {[number, number]} position */
	setAbsolutePosition([x, y]) {
		const [px, py] = this.parent?.absolutePosition.get() ?? [0, 0]
		const [spx, spy] = this.parent?.scale.get() ?? [1, 1]
		this.position.set([(x - px) / spx, (y - py) / spy])
	}

	static Root = new Transform()
	static Inverse = class extends Transform {
		/** @returns {[number, number]} */
		getAbsolutePosition() {
			const [x, y] = this.position.get()
			const [px, py] = this.parent?.absolutePosition.get() ?? [0, 0]
			const [spx, spy] = this.parent?.scale.get() ?? [1, 1]
			return [x / spx - px / spx, y / spy - py / spy]
		}
	}
}
