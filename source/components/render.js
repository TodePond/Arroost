import { Component, SVG, use } from "../../libraries/habitat-import.js"

export const Svg = class extends Component {
	name = "svg"
	render() {
		return this.entity?.render()
	}

	get element() {
		if (this._element === undefined) {
			const rendered = this.render()
			const group = SVG(`<g />`)

			use(() =>
				group.setAttribute(
					"transform",
					`rotate(${this.entity.transform.rotation}) translate(${this.entity.transform.position.x}, ${this.entity.transform.position.y}) scale(${this.entity.transform.scale.x}, ${this.entity.transform.scale.y})`,
				),
			)

			if (rendered) {
				group.append(rendered)
			}
			this._element = group
		}

		return this._element
	}
}
