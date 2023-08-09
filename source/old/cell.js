import { BLACK, GREY, SILVER, WHITE } from "../../libraries/habitat-import.js"
import { Component } from "../arroost/components/component.js"
import { shared } from "../main.js"
import { c, createCell } from "../nogan/nogan.js"
import { Prodding, Tickling } from "./arrows/tickler/tickler.js"
import { Hovering } from "./states.js"

export const Cell = class extends Component {
	constructor({ parent = shared.level, ...rest } = {}) {
		super("cell")
		const options = { parent, ...rest }
		const cell = createCell(shared.nogan, options)

		// ID
		this.id = c(cell.id)

		// FIRE
		this.fire = this.use(() => ({
			red: false,
			blue: false,
			green: false,
		}))

		// BACKGROUND COLOUR
		this.background = this.use(() => {
			if (this.firing) return BLACK
			return GREY
		})

		// FOREGROUND COLOUR
		this.foreground = this.use(() => {
			return SILVER
		})
	}

	onAttach(entity) {
		const { transform } = entity
		this.foreground = this.use(() => {
			const { entity } = this
			if (!this.entity) return SILVER
			if (entity.input.state === Tickling) return WHITE
			if (entity.input.state === Prodding) return BLACK
			if (entity.cell.Firing) return BLACK
			if (entity.input.state === Hovering) return WHITE
			return SILVER
		})

		this.use(() => {
			// const foo = transform.absolutePosition
		})
	}
}
