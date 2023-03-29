const fire = (machine, name, event) => {
	const { entity } = event.target
	event.entity = entity
	event.input = entity?.input
	machine.fire(name, [event])
}

const listen = (machine, name) => {
	addEventListener(name, (event) => {
		fire(machine, name, event)
	})
}

export const connectMachine = (machine) => {
	listen(machine, "pointerover")
	listen(machine, "pointerout")
}
