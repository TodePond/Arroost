import { Machine, memo, State } from "../../libraries/habitat-import.js"
import { connectMachine } from "./machine.js"

export const getHover = memo(() => {
	const hover = new State({
		input: undefined,
		entity: undefined,
		pointerOver(event) {
			const { entity, input } = event
			this.entity = entity
			this.input = input
		},
		pointerOut() {
			this.entity = undefined
			this.input = undefined
		},
	})

	const machine = new Machine(hover)
	connectMachine(machine)
	return hover
})
