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
				const input = event.target?.["input"]
				event["input"] = input
				machine.fire(eventName, [event, machine.state])
			},
			{ passive: false },
		)
	}
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
