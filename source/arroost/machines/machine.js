export const registerMachine = (machine) => {
	for (const eventName of EVENTS) {
		addEventListener(
			eventName,
			(event) => {
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
	"tick",
	"touchend",
	"touchstart",
	"touchmove",
	"touchcancel",
]
