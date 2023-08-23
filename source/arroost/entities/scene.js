import { shared } from "../../main.js"
import { Transform } from "../components/transform.js"
import { Entity } from "./entity.js"
import { Ellipse } from "./shapes/ellipse.js"
import { Dom } from "../components/dom.js"
import { Dummy } from "./cells/dummy.js"
import { equals, fireEvent } from "../../../libraries/habitat-import.js"
import { Dragging } from "../input/machines/input.js"
import { Input } from "../components/input.js"
import { Carry } from "../components/carry.js"
import { Movement } from "../components/movement.js"

const ZOOM_FRICTION = 0.75

export class Scene extends Entity {
	constructor() {
		super()
		this.input = this.attach(new Input(this))
		this.movement = this.attach(new Movement())
		this.dom = this.attach(new Dom({ id: "scene", type: "html", input: this.input }))

		this.dom.transform.position.set([innerWidth / 2, innerHeight / 2])
		const dummy = new Dummy()
		this.dom.append(dummy.dom)
		dummy.dom.style.pointerEvents.set("none")
		this.dummy = dummy

		this.input.state("hovering").pointerdown = this.onHoveringPointerDown.bind(this)
	}

	start({ html }) {
		const container = this.dom.getContainer()
		html.append(container)
	}

	onHoveringPointerDown() {
		const dummy = new Dummy()
		this.dom.append(dummy.dom)
		dummy.dom.transform.position.set(shared.pointer.transform.absolutePosition.get())
		return new Dragging()
	}

	zoomSpeed = this.use(0.0)

	tick() {
		fireEvent("tick")
		shared.pointer.tick()
		this.movement.tick(this.dom.transform)

		const velocity = this.movement.velocity.get()
		const pointerPosition = shared.pointer.transform.position.get()

		if (!equals(velocity, [0, 0])) {
			fireEvent(
				"pointermove",
				{
					clientX: pointerPosition.x,
					clientY: pointerPosition.y,
					target: document.elementFromPoint(pointerPosition.x, pointerPosition.y),
					pointerId: -1,
				},
				PointerEvent,
			)
		}

		const zoomSpeed = this.zoomSpeed.get()
		this.zoom(zoomSpeed)
		this.zoomSpeed.set(zoomSpeed * ZOOM_FRICTION)
		// // if (Math.abs(this.zoomSpeed).d < 0.5) {
		// // 	this.zoomSpeed = 0
		// // }
	}

	zoom(delta) {
		const scale = this.dom.transform.scale.get()
		const oldZoom = scale.x
		const newZoom = oldZoom * (1 - delta)
		this.dom.transform.scale.set([newZoom, newZoom])

		// const pointerOffset = subtract(pointer.position, transform.position)
		// const scaleRatio = newZoom / oldZoom
		// const scaledPointerOffset = scale(pointerOffset, scaleRatio)
		// transform.position = subtract(pointer.position, scaledPointerOffset)
	}

	// onHoveringEnter() {
	// 	setCursor("default")
	// }

	// onHoveringPointerDown() {
	// 	return Dragging
	// }

	// onDraggingEnter(previous, state) {
	// 	this.movement.velocity = [0, 0]
	// 	setCursor("move")
	// }

	// onDraggingPointerUp() {
	// 	this.movement.velocity = [...shared.pointer.velocity]
	// }

	// onDraggingPointerMove(event, state) {
	// 	const pointerDisplacement = subtract(shared.pointer.absolutePosition, state.pointerStart)
	// 	this.transform.position = add(state.inputStart, pointerDisplacement)
	// }
}
