import { SVG } from "../../libraries/habitat-import.js"
import { DisposableComponent } from "./disposable.js"

export const Svg = class extends DisposableComponent {
	name = "svg"
	render() {
		return this.entity?.render()
	}

	get element() {
		if (this._element === undefined) {
			const rendered = this.render()
			const group = SVG(`<g />`)

			this.use(() => {
				const [width, height] = this.entity.rectangle.dimensions
				group.setAttribute("transform-origin", `${width / 2}px ${height / 2}px`)
			})

			this.use(() => {
				const { transform } = this.entity
				const { position, rotation, scale } = transform
				group.setAttribute(
					"transform",
					`translate(${position.x}, ${position.y}) rotate(${rotation}) scale(${scale.x}, ${scale.y})`,
				)
			})

			if (rendered) {
				group.append(rendered)
			}

			this._element = group
		}

		return this._element
	}
}
