const fire = (machine, name, event) => {
	const { entity } = event.target
	event.entity = entity
	event.input = entity?.input
	machine.fire(name, [event, machine.state])
}

export const registerMachine = (machine) => {
	for (const eventName of EVENTS) {
		addEventListener(
			eventName,
			(event) => {
				event["state"] = machine.state.get()
				machine.fire(eventName, event)
			},
			{ passive: false },
		)
	}
	return machine
}

const EVENTS = [
	"pointerover",
	"pointerout",
	"pointerdown",
	"pointerup",
	"pointermove",
	"wheel",
	"keydown",
	"keyup",
]
