import { State as _State } from "../../../libraries/habitat-import.js"
import { shared } from "../main.js"
import { setCursor } from "./cursor.js"

export const State = class extends _State {
	static options = {
		..._State.options,
		cursor: () => "default",
		input: () => undefined,
	}

	fire(name, args) {
		if (this.input === undefined) {
			this.input = shared.camera.input
		}

		if (name === "enter") {
			setCursor(this.cursor)
		}

		return this.resolve(name, args)
	}

	resolve(name, args) {
		name = name[0].toUpperCase() + name.slice(1)

		const inputStateResult = this.input.fire(`on${this.name}${name}`.d, args)
		if (inputStateResult !== undefined) return inputStateResult

		const inputGeneralResult = this.input.fire(`on${name}`, args)
		if (inputGeneralResult !== undefined) return inputGeneralResult

		return super.fire(`on${name}`, args)
	}
}
