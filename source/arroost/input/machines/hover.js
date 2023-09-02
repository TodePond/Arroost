import { State, fireEvent, use } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"

let somethingHasMoved = false
export const triggerSomethingHasMoved = () => {
	somethingHasMoved = true
}

class Hovering extends State {
	input = use(shared.scene.input)

	tick() {
		if (!somethingHasMoved) return
		somethingHasMoved = false
		const point = shared.pointer.transform.position.get()
		if (point.x === undefined || point.y === undefined) return
		const element = document.elementFromPoint(point.x, point.y)
		if (!element) return
		const oldInput = this.input.get()
		const newInput = element["input"] ?? shared.scene.input
		if (oldInput !== newInput) {
			fireEvent(
				"pointerover",
				{
					clientX: point.x,
					clientY: point.y,
					target: element,
					pointerId: -1,
				},
				PointerEvent,
			)
		}
	}

	pointerover(event) {
		const { input = shared.scene.input } = event.target
		const oldInput = this.input.get()
		if (oldInput === input) return
		this.input.set(input)
	}
}

export const HoverMachine = Hovering
