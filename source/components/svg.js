import { SVG } from "../../libraries/habitat-import.js"
import { Component } from "./component.js"

export const Svg = class extends Component {
	name = "svg"
	render() {
		return this.entity?.render()
	}

	get element() {
		if (this._element === undefined) {
			const group = SVG(`<g />`)
			group.entity = this.entity
			group.input = this.entity?.input
			this._element = group
			const rendered = this.render()

			this.use(() => {
				const { transform } = this.entity
				const { position, rotation, scale } = transform
				group.setAttribute(
					"transform",
					`translate(${position.x}, ${position.y}) rotate(${rotation}) scale(${scale.x}, ${scale.y})`,
				)
			})

			if (rendered) {
				rendered.entity = this.entity
				rendered.input = this.entity?.input
				group.prepend(rendered)
			}
		}

		return this._element
	}
}
