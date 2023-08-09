import { Component } from "../arroost/components/component.js"

export const Svg = class extends Component {
	name = "svg"
	render() {
		return this.entity?.render()
	}

	get element() {
		if (this._element === undefined) {
			const group = document.createElementNS("http://www.w3.org/2000/svg", "svg")
			group.entity = this.entity
			group.input = this.entity?.input
			this._element = group
			const rendered = this.render()

			this.use(() => {
				const { transform } = this.entity
				const { position, rotation, scale } = transform
				if (isNaN(position.x)) {
					throw new Error(`Position x is NaN`)
				}
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