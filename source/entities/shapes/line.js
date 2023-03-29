export const Line = class extends Thing {
	render() {
		const { parent } = this
		if (parent === undefined) return

		const line = SVG(`<line />`)
		line.setAttribute("x1", 0)
		line.setAttribute("y1", 0)

		const { position } = this.transform

		this.use(() => line.setAttribute("stroke", this.style.stroke))
		this.use(() => {
			line.setAttribute("x2", position.x)
			line.setAttribute("y2", position.y)
		})

		return line
	}
}
