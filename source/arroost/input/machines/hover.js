import { State, fireEvent, use } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"

class Hovering extends State {
	input = use(shared.scene.input)
	tick() {
		const point = shared.pointer.transform.position.get()
		const element = document.elementFromPoint(point.x, point.y)
		if (!element) return
		const oldInput = this.input.get()
		const newInput = element["input"] ?? shared.scene.input
		if (oldInput !== newInput) {
			const oldElement = oldInput.entity.dom.getElement()

			// fireEvent(
			// 	"pointerout",
			// 	{
			// 		clientX: point.x,
			// 		clientY: point.y,
			// 		target: oldElement,
			// 		pointerId: -1,
			// 	},
			// 	PointerEvent,
			// )

			fireEvent(
				"pointerover",
				{
					clientX: point.x,
					clientY: point.y,
					target: element,
					pointerId: -1,
					bubbles: false,
				},
				PointerEvent,
			)
		}
	}

	pointerover(event) {
		const { input = shared.scene.input } = event.target
		// console.log(event.target)
		const oldInput = this.input.get()
		if (oldInput === input) return
		this.input.set(input)
		// console.log(input.entity)
	}
}

export const Hover = Hovering
