const fire = (machine, name, event) => {
	const { entity } = event.target
	event.entity = entity
	event.input = entity?.input
	machine.fire(name, [event, machine.state])
}

const listen = (machine, eventName, methodName) => {
	addEventListener(eventName, (event) => fire(machine, methodName, event), { passive: false })
}

export const connectMachine = (machine) => {
	listen(machine, "pointerover", "pointerOver")
	listen(machine, "pointerout", "pointerOut")
	listen(machine, "pointerdown", "pointerDown")
	listen(machine, "pointerup", "pointerUp")
	listen(machine, "pointermove", "pointerMove")
	listen(machine, "wheel", "wheel")
}
