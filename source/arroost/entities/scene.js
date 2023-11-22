import { GREY_SILVER, shared } from "../../main.js"
import { Entity } from "./entity.js"
import { Dom } from "../components/dom.js"
import {
	GREY,
	Habitat,
	WHITE,
	add,
	distanceBetween,
	equals,
	fireEvent,
	subtract,
	use,
} from "../../../libraries/habitat-import.js"
import { Dragging } from "../machines/input.js"
import { Input } from "../components/input.js"
import { Movement } from "../components/movement.js"
import { Ghost } from "./ghost.js"
import { Counter } from "./counter.js"
import { replenishUnlocks } from "./unlock.js"
import { Title } from "./title.js"
import { TextHtml } from "./shapes/text-html.js"
import { Transform } from "../components/transform.js"

const ZOOM_FRICTION = 0.75

export class Scene extends Entity {
	width = this.use(innerWidth)
	height = this.use(innerHeight)

	focusMode = this.use(false)

	bounds = this.use({
		left: 0,
		top: 0,
		width: innerWidth,
		height: innerHeight,
		right: innerWidth,
		bottom: innerHeight,
		center: [innerWidth / 2, innerHeight / 2],
	})

	constructor() {
		super()
		shared.scene = this
		this.input = this.attach(new Input(this))
		this.dom = this.attach(new Dom({ id: "scene", type: "html", input: this.input }))
		this.movement = this.attach(new Movement({ transform: this.dom.transform }))
		this.movement.friction.set([0.9, 0.9])

		this.dom.transform.position.set([innerWidth / 2, innerHeight / 2])

		const hovering = this.input.state("hovering")
		hovering.pointerdown = this.onHoveringPointerDown.bind(this)

		const dragging = this.input.state("dragging")
		dragging.pointerdown = this.onDraggingPointerDown.bind(this)
		dragging.pointermove = this.onDraggingPointerMove.bind(this)
		dragging.pointerup = this.onDraggingPointerUp.bind(this)

		this.use(() => {
			const _dragging = dragging.active.get()

			if (!shared.stage.context.html) return
			if (_dragging) {
				shared.stage.context.html.style["cursor"] = "grabbing"
			} else {
				shared.stage.context.html.style["cursor"] = "default"
			}
		})

		this.use(() => {
			const [sx, sy] = this.dom.transform.position.get() ?? [0, 0]
			const [ssx, ssy] = this.dom.transform.scale.get() ?? [1, 1]

			const screenLeft = -sx / ssx
			const screenTop = -sy / ssy
			const screenWidth = this.width.get() / ssx
			const screenHeight = this.height.get() / ssy

			const screenRight = screenLeft + screenWidth
			const screenBottom = screenTop + screenHeight

			this.bounds.set({
				left: screenLeft,
				top: screenTop,
				width: screenWidth,
				height: screenHeight,
				right: screenRight,
				bottom: screenBottom,
				center: [(screenLeft + screenRight) / 2, (screenTop + screenBottom) / 2],
			})
		}, [this.dom.transform.position, this.dom.transform.scale, this.width, this.height])

		const layer = (this.layer = {
			wire: new Dom({ id: "wire-layer", type: "html" }),
			cell: new Dom({ id: "cell-layer", type: "html" }),
			ghost: new Dom({ id: "ghost-layer", type: "html" }),
			hud: new Dom({ id: "hud-layer", type: "html" }),
		})

		this.dom.append(layer.wire)
		this.dom.append(layer.cell)
		this.dom.append(layer.ghost)

		this.title = this.attach(new Title())
		this.layer.ghost.append(this.title.dom)

		this.focusModeIndicator = this.attach(new TextHtml())
		this.focusModeIndicator.value.set("Focus mode on (press F to toggle)")
		this.focusModeIndicator.dom.style.fontFamily.set("Rosario")
		this.focusModeIndicator.dom.transform.position.set([120, 20])
		this.focusModeIndicator.dom.style.color.set(GREY_SILVER.toString())
		this.use(() => {
			if (this.focusMode.get()) {
				this.focusModeIndicator.dom.style.visibility.set("visible")
			} else {
				this.focusModeIndicator.dom.style.visibility.set("hidden")
				Tone.Master.mute = false
			}
		}, [this.focusMode])
		this.layer.hud.append(this.focusModeIndicator.dom)

		addEventListener("keydown", () => replenishUnlocks(true), { once: true })
		addEventListener("pointerdown", () => replenishUnlocks(true), { once: true })
	}

	start({ html }) {
		this.html = html
		const container = this.dom.getContainer()
		html.append(container)
		html.append(this.layer.hud.getContainer())
	}

	resize() {
		this.height.set(innerHeight)
		this.width.set(innerWidth)
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
