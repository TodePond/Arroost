import { t } from "../../nogan/nogan.js"
import { FULL } from "../unit.js"
import { Component } from "./component.js"
import { Transform } from "./transform.js"

export const Bounds = class extends Component {
	/** @param {Transform} transform */
	constructor(transform) {
		super()
		const { scale } = transform

		this.dimensions = this.use(t([FULL, FULL]))
		this.dimensionsAbsolute = this.use(() => {
			const [sx, sy] = scale.get()
			const [w, h] = this.dimensions.get()
			return [w * sx, h * sy]
		})

		this.left = this.snuse(() => {
			const [x] = transform.position.get()
			const [w] = this.dimensions.get()
			return x - w / 2
		})
	}
}
