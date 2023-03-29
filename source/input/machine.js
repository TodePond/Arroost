const fire = (machine, name, event) => {
	const { entity } = event.target
	event.entity = entity
	machine.fire(name, [event])
}

const listen = (machine, name) => {
	addEventListener(name, (event) => {
		fire(machine, name, event)
	})
}

export const connectMachine = (machine) => {
	listen(machine, "pointerover")
}
