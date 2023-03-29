import { GREEN } from "../../../libraries/habitat-import.js"
import { Box } from "../box.js"

export const ArrowOfCreation = class extends Box {
	render() {
		const { style, rectangle } = this
		const { dimensions } = rectangle

		style.fill = GREEN

		const horizontal = new Box()
		const vertical = new Box()
		this.add(horizontal)
		this.add(vertical)
		this.use(() => {
			const [width, height] = dimensions
			horizontal.transform.position = [0, height / 3]
			horizontal.rectangle.dimensions = [width, height / 3]
			vertical.transform.position = [width / 3, 0]
			vertical.rectangle.dimensions = [width / 3, height]
		})

		return super.render()
	}
}
