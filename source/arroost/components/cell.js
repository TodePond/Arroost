import { BLACK, GREY, SILVER, WHITE } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { createCell } from "../../nogan/nogan.js"
import { Prodding, Tickling } from "../entities/arrows/tickler/tickler.js"
import { Component } from "./component.js"

export const Cell = class extends Component {
	constructor({ parent = shared.level, ...rest }) {
		super("cell")
		const options = { parent, ...rest }
		const cell = createCell(shared.nogan, options)

		this.id = cell.id

		this.fire = this.use(() => ({
			red: false,
			blue: false,
			green: false,
		}))

		this.background = this.use(() => {
			if (this.firing) return BLACK
			return GREY
		})

		// Relies on entity
		this.use(() => {
			const { entity } = this
			if (!entity) return

			this.foreground = this.use(() => {
				if (entity.input.state === Tickling) return WHITE
				if (entity.input.state === Prodding) return BLACK
				if (entity.cell.Firing) return BLACK
				if (entity.input.Hovering) return WHITE
				return SILVER
			})
		})
	}
}
