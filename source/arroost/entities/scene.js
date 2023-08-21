import { shared } from "../../main.js"
import { Transform } from "../components/transform.js"
import { Entity } from "./entity.js"
import { Ellipse } from "./shapes/ellipse.js"
import { Dom } from "../components/dom.js"
import { Dummy } from "./cells/dummy.js"
import { fireEvent } from "../../../libraries/habitat-import.js"
import { Input } from "../components/input.js"
import { Dragging } from "../input/machines/point.js"

// const ZOOM_FRICTION = 0.75

export class Scene extends Entity {
	constructor() {
		super()
		this.input = this.attach(new Input(this))
		this.dom = this.attach(new Dom({ id: "scene", type: "html", input: this.input }))

		this.dom.transform.position.set([innerWidth / 2, innerHeight / 2])
		const dummy = new Dummy()
		this.dom.append(dummy.dom)

		this.input.state("hovering").pointerdown = this.onHoveringPointerDown.bind(this)
	}

	start({ html }) {
		const container = this.dom.getContainer()
		html.append(container)
	}

	tick() {
		shared.pointer.tick()
		fireEvent("tick")
	}

	onHoveringPointerDown() {
		return new Dragging()
	}

	// zoomSpeed = this.use(0.0)

	// tick() {
	// 	const { pointer } = shared

	// 	if (pointer.position.x === undefined || pointer.position.y === undefined) {
	// 		return
	// 	}

	// 	pointer.tick()

	// 	const { movement } = this
	// 	const { velocity } = movement

	// 	movement.update()
	// 	if (!equals(movement.velocity, [0, 0])) {
	// 		fireEvent(
	// 			"pointermove",
	// 			{
	// 				clientX: pointer.position.x,
	// 				clientY: pointer.position.y,
	// 				target: shared.machine.state.input.entity.svg.element,
	// 			},
	// 			PointerEvent,
	// 		)
	// 	}
	// 	movement.applyFriction()

	// 	this.zoom(this.zoomSpeed)
	// 	this.zoomSpeed *= ZOOM_FRICTION
	// 	// if (Math.abs(this.zoomSpeed).d < 0.5) {
	// 	// 	this.zoomSpeed = 0
	// 	// }
	// }

	// zoom(delta) {
	// 	const { pointer } = shared
	// 	const { transform } = this
	// 	const oldZoom = transform.scale.x
	// 	const newZoom = oldZoom * (1 - delta)
	// 	transform.scale = [newZoom, newZoom]

	// 	const pointerOffset = subtract(pointer.position, transform.position)
	// 	const scaleRatio = newZoom / oldZoom
	// 	const scaledPointerOffset = scale(pointerOffset, scaleRatio)
	// 	transform.position = subtract(pointer.position, scaledPointerOffset)
	// }

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
