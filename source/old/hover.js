import { Machine, State } from "../../libraries/habitat-import.js"
import { connectMachine } from "./machine.js"

export const getHover = () => {
	const hover = new State({
		input: undefined,
		entity: undefined,
		pointerOver(event) {
			const { entity, input } = event
			this.entity = entity
			this.input = input
		},
	})

	const machine = new Machine(hover)
	connectMachine(machine)
	return hover
}
