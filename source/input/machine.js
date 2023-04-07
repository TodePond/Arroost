const fire = (machine, name, event) => {
	const { entity } = event.target
	event.entity = entity
	event.input = entity?.input
	machine.fire(name, [event])
}

const listen = (machine, name) => {
	addEventListener(name, (event) => fire(machine, name, event), { passive: false })
}

export const connectMachine = (machine) => {
	listen(machine, "pointerover")
	listen(machine, "pointerout")
	listen(machine, "pointerdown")
	listen(machine, "pointerup")
	listen(machine, "pointermove")
	listen(machine, "wheel")
}
