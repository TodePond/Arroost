import { State as _State } from "../../../libraries/habitat-import.js"
import { setCursor } from "./cursor.js"

export const State = class extends _State {
	static options = {
		..._State.options,
		cursor: () => "default",
		input: () => undefined,
	}

	constructor(head, tail = {}) {
		super(head, tail)
	}

	fire(name, args) {
		if (name === "enter") {
			setCursor(this.cursor)
			const [previous] = args
			this.input = previous?.input
			if (previous) {
				this.input[previous.name] = false
			}
			if (this.input !== undefined) {
				this.input.state = this
				this.input[this.name] = true
			}
		}

		return this.resolve(name, args)
	}

	resolve(name, args) {
		name = name[0].toUpperCase() + name.slice(1)

		if (this.input) {
			const inputStateResult = this.input.fire(`on${this.name}${name}`, args)
			if (inputStateResult !== undefined) return inputStateResult

			const inputGeneralResult = this.input.fire(`on${name}`, args)
			if (inputGeneralResult !== undefined) return inputGeneralResult
		}

		return super.fire(`on${name}`, args)
	}
}
