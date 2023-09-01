import { shared } from "../../main.js"
import { Transform } from "../components/transform.js"
import { Entity } from "./entity.js"
import { Ellipse } from "./shapes/ellipse.js"
import { Dom } from "../components/dom.js"
import { Dummy } from "./cells/dummy.js"
import { Habitat, add, equals, fireEvent, subtract } from "../../../libraries/habitat-import.js"
import { Dragging } from "../input/machines/input.js"
import { Input } from "../components/input.js"
import { Carry } from "../components/carry.js"
import { Movement } from "../components/movement.js"
import { DummyCreation } from "./cells/dummy-creation.js"

const ZOOM_FRICTION = 0.75

export class Scene extends Entity {
	constructor() {
		super()
		this.input = this.attach(new Input(this))
		this.dom = this.attach(new Dom({ id: "scene", type: "html", input: this.input }))
		this.movement = this.attach(new Movement(this.dom.transform))
		this.movement.friction.set([0.9, 0.9])

		this.dom.transform.position.set([innerWidth / 2, innerHeight / 2])
		const dummy = new DummyCreation()
		this.dom.append(dummy.dom)
		this.dummy = dummy

		const hovering = this.input.state("hovering")
		hovering.pointerdown = this.onHoveringPointerDown.bind(this)

		const dragging = this.input.state("dragging")
		dragging.pointerdown = this.onDraggingPointerDown.bind(this)
		dragging.pointermove = this.onDraggingPointerMove.bind(this)
		dragging.pointerup = this.onDraggingPointerUp.bind(this)
	}

	start({ html }) {
		const container = this.dom.getContainer()
		html.append(container)
	}

	onHoveringPointerDown(e) {
		return new Dragging()
	}

	onDraggingPointerDown(e) {
		this.movement.velocity.set([0, 0])
		const pointerPosition = shared.pointer.transform.position.get()
		const position = this.dom.transform.position.get()
		e.state.pointerStart = pointerPosition
		e.state.start = position
	}

	onDraggingPointerMove(e) {
		const pointerPosition = shared.pointer.transform.position.get()
		const pointerStart = e.state.pointerStart
		const start = e.state.start
		const newPosition = add(pointerPosition, subtract(start, pointerStart))
		this.dom.transform.setAbsolutePosition(newPosition)
	}

	onDraggingPointerUp(e) {
		const velocity = shared.pointer.velocity.get()
		this.movement.velocity.set(velocity)
	}

	tick() {
		fireEvent("tick")

		const velocity = this.movement.velocity.get()
		const pointerPosition = shared.pointer.transform.position.get()

		if (
			!equals(velocity, [0, 0]) &&
			pointerPosition.x !== undefined &&
			pointerPosition.y !== undefined
		) {
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
		this.zoomSpeed.set(zoomSpeed * ZOOM_FRICTION)
		if (zoomSpeed !== 0 && Math.abs(zoomSpeed) < 0.001) {
			this.zoomSpeed.set(0)
		} else {
			this.zoom(shared.zoomer.speed + zoomSpeed)
		}
	}

	zoomSpeed = this.use(0.0)
	zoom(speed) {
		const scale = this.dom.transform.scale.get()
		const oldZoom = scale.x
		const newZoom = oldZoom * (1 - speed)
		this.dom.transform.scale.set([newZoom, newZoom])

		const position = this.dom.transform.position.get()
		const pointerPosition = shared.pointer.transform.position.get()

		const pointerOffset = subtract(pointerPosition, position)
		const scaleRatio = newZoom / oldZoom
		const scaledPointerOffset = Habitat.scale(pointerOffset, scaleRatio)
		this.dom.transform.position.set(subtract(pointerPosition, scaledPointerOffset))
	}
}
