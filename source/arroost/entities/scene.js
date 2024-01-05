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
	scale,
	subtract,
	use,
} from "../../../libraries/habitat-import.js"
import { Dragging } from "../machines/input.js"
import { Input } from "../components/input.js"
import { Movement } from "../components/movement.js"
import { replenishUnlocks } from "./unlock.js"
import { Title } from "./title.js"
import { TextHtml } from "./shapes/text-html.js"
import { Transform } from "../components/transform.js"
import { CELL_CONSTRUCTORS, Tunnel, WIRE_CONSTRUCTOR } from "../components/tunnel.js"
import {
	CHILD_SCALE,
	PARENT_SCALE,
	ZOOMING_IN_THRESHOLD,
	ZOOMING_OUT_THRESHOLD,
	ZOOM_IN_THRESHOLD,
} from "../unit.js"
import { c, getCell, getTemplate, iterateCells, iterateWires, t } from "../../nogan/nogan.js"
import { Infinite } from "../components/infinite.js"
import { checkUnderPointer, triggerSomethingHasMoved } from "../machines/hover.js"
import { Marker } from "./debug/marker.js"
import { ArrowOfTiming } from "./arrows/timing.js"
import { ArrowOfColour } from "./arrows/colour.js"

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
		center: t([innerWidth / 2, innerHeight / 2]),
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

			if (shared.hero.get() === "luke") {
				if (_dragging) {
					document.body.style.cursor = "grabbing"
				} else {
					document.body.style.cursor = "default"
				}
			}
		}, [dragging.active])

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

		this.recreateSceneLayers()

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

		// const centerMarker = new Marker()
		// this.layer.ghost.append(centerMarker.dom)
		// centerMarker.dom.transform.setAbsolutePosition([0, 0])

		// const cameraCenterMarker = new Marker()
		// this.layer.ghost.append(cameraCenterMarker.dom)
		// this.use(() => {
		// 	cameraCenterMarker.dom.transform.setAbsolutePosition(this.bounds.get().center)
		// 	const scale = this.dom.transform.scale.get().x
		// 	cameraCenterMarker.dom.transform.scale.set([(1 / scale) * 0.3, (1 / scale) * 0.3])
		// }, [this.bounds])

		addEventListener("keydown", () => replenishUnlocks(true), { once: true })
		addEventListener("pointerdown", () => replenishUnlocks(true), { once: true })
	}

	start({ html }) {
		this.html = html
		const container = this.dom.getContainer()
		html.append(container)
		html.append(this.layer.hud.getContainer())

		// const centerMarker = new Marker()
		// this.layer.hud.append(centerMarker.dom)
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
		this.shouldDealWithInfinites = true
	}

	shouldDealWithInfinites = false

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
			this.shouldDealWithInfinites = true
		}

		const zoomSpeed = this.zoomSpeed.get()
		this.zoomSpeed.set(zoomSpeed * ZOOM_FRICTION)
		if (zoomSpeed !== 0 && Math.abs(zoomSpeed) < 0.001) {
			this.zoomSpeed.set(0)
		} else {
			this.zoom(shared.zoomer.speed + zoomSpeed)
		}

		if (this.shouldDealWithInfinites) {
			this.shouldDealWithInfinites = false
			this.dealWithInfinites()
		}
	}

	zoomSpeed = this.use(0.0)
	zoom(speed) {
		if (speed === 0) return
		const scale = this.dom.transform.scale.get()
		const oldZoom = scale.x
		const newZoom = oldZoom * (1 - speed)

		this.setZoom(newZoom)
	}

	setZoom(newZoom) {
		const oldZoom = this.dom.transform.scale.get().x
		this.dom.transform.scale.set([newZoom, newZoom])
		const position = this.dom.transform.position.get()
		const pointerPosition = shared.pointer.transform.position.get()

		const pointerOffset = subtract(pointerPosition, position)
		const scaleRatio = newZoom / oldZoom
		const scaledPointerOffset = Habitat.scale(pointerOffset, scaleRatio)
		this.dom.transform.position.set(subtract(pointerPosition, scaledPointerOffset))

		this.shouldDealWithInfinites = true
	}

	setCameraCenter(position = [0, 0]) {
		const { width, height } = this.bounds.get()
		const scale = this.dom.transform.scale.get().x
		this.dom.transform.position.set([
			(width / 2 - position.x) * scale,
			(height / 2 - position.y) * scale,
		])

		triggerSomethingHasMoved()
		fireEvent("pointermove", {
			clientX: shared.pointer.transform.position.get().x,
			clientY: shared.pointer.transform.position.get().y,
			pointerId: -1,
			target: window, //maybe needs to be more specific?
		})
		shared.scene.shouldDealWithInfinites = true
	}

	moveCameraCenter(displacement = [0, 0]) {
		const { center } = this.bounds.get()
		const newCenter = add(center, displacement)
		this.setCameraCenter(newCenter)
	}

	/**
	 * @type {Signal<null | Entity & {
	 * 	infinite: Infinite;
	 * 	dom: Dom
	 *  input: Input
	 * }>}
	 * */
	infiniteTarget = this.use(null)

	dealWithInfinites() {
		const scale = this.dom.transform.scale.get().x
		if (scale < ZOOMING_IN_THRESHOLD) {
			const oldState = this.infiniteTarget.get()?.infinite.state.get()

			this.infiniteTarget.get()?.infinite.state.set("none")
			this.infiniteTarget.set(null)

			if (oldState === "zooming-in") {
				checkUnderPointer()
			}

			if (scale < ZOOMING_OUT_THRESHOLD) {
				// console.log(scale)
				this.replaceLayerBackwards()
				// console.log(shared.scene.dom.transform.scale.get().x)
			}

			return
		}

		// TODO: this should also factor in z-index
		// and maybe have a minimum distance from the center of the screen
		let distanceFromScreenCenter = Infinity
		let closestTunnel = null
		for (const tunnel of Tunnel.inViewInfiniteTunnels.values()) {
			const cell = getCell(shared.nogan, tunnel.id)
			if (!cell) throw new Error("No cell found for tunnel")
			if (cell.parent !== shared.level) continue
			const { transform } = tunnel.entity.dom
			const position = transform.position.get()
			const distance = distanceBetween(position, this.bounds.get().center)
			if (distance < distanceFromScreenCenter) {
				distanceFromScreenCenter = distance
				closestTunnel = tunnel
			}
		}

		const newTarget = closestTunnel?.entity ?? null

		// Swap out infinite target
		if (newTarget !== this.infiniteTarget.get()) {
			this.infiniteTarget.get()?.infinite.state.set("none")
			this.infiniteTarget.set(newTarget)

			if (newTarget) {
				newTarget.infinite.state.set("zooming-in")
			}
		}

		if (!closestTunnel) return

		// print(
		// 	"CELL:",
		// 	...closestTunnel.entity.dom.transform.absolutePosition.get().map((v) => parseInt("" + v)),
		// )

		// print("SCENE:", ...this.dom.transform.absolutePosition.get().map((v) => parseInt("" + v)))

		// print("CAMERA:", ...this.bounds.get().center.map((v) => parseInt("" + v)))

		if (shared.scene.dom.transform.scale.get().x < ZOOM_IN_THRESHOLD) {
			return
		}

		this.replaceLayer(closestTunnel)
	}

	sceneLayerNames = c(["wire", "timing", "cell", "ghost"])

	layer = {
		wire: new Dom({ id: "wire-layer-placeholder", type: "html" }),
		timing: new Dom({ id: "timing-layer-placeholder", type: "html" }),
		cell: new Dom({ id: "cell-layer-placeholder", type: "html" }),
		ghost: new Dom({ id: "ghost-layer-placeholder", type: "html" }),
		hud: new Dom({ id: "hud-layer", type: "html" }),
	}

	recreateSceneLayers() {
		this.layer.wire = new Dom({ id: "wire-layer", type: "html" })
		this.layer.timing = new Dom({ id: "timing-layer", type: "html" })
		this.layer.cell = new Dom({ id: "cell-layer", type: "html" })
		this.layer.ghost = new Dom({ id: "ghost-layer", type: "html" })

		this.dom.append(this.layer.wire)
		this.dom.append(this.layer.timing)
		this.dom.append(this.layer.cell)
		this.dom.append(this.layer.ghost)
	}

	/**
	 * @param {Tunnel} tunnel
	 */
	replaceLayer(tunnel) {
		for (const layerName of this.sceneLayerNames) {
			const layer = this.layer[layerName]
			layer.dispose()
		}

		shared.level = tunnel.id

		this.recreateSceneLayers()

		this.rebuildWorldFromNogan()

		const { center } = this.bounds.get()
		const targetPosition = tunnel.entity.dom.transform.absolutePosition.get()
		const position = scale(subtract(center, targetPosition), PARENT_SCALE)

		const zoomDiff = shared.scene.dom.transform.scale.get().x - ZOOM_IN_THRESHOLD
		this.setZoom((ZOOM_IN_THRESHOLD + zoomDiff) * CHILD_SCALE)
		this.setCameraCenter(position)
		this.infiniteTarget.get()?.infinite.state.set("none")
		this.infiniteTarget.set(null)
		Tunnel.purgeOtherLevelInfiniteTunnels()
		checkUnderPointer()
		// this.recreateSceneLayers()
		// shared.level = tunnel.id
	}

	replaceLayerBackwards() {
		for (const layerName of this.sceneLayerNames) {
			const layer = this.layer[layerName]
			layer.dispose()
		}

		const oldLevelCell = getCell(shared.nogan, shared.level)
		if (!oldLevelCell) throw new Error("Missing level cell - this shouldn't happen")
		shared.level = oldLevelCell.parent

		let cellToComeOutOf = oldLevelCell.id
		// If we're at the top level, just find any cell on the top level
		if (shared.level === 0) {
			// Purge everything, because we're gonna remake it
			shared.level = NaN
			Tunnel.purgeOtherLevelInfiniteTunnels()
			shared.level = 0

			for (const cell of iterateCells(shared.nogan)) {
				if (cell.id === 0) continue
				if (cell.parent === 0) {
					cellToComeOutOf = cell.id
					break
				}
			}
		}

		this.recreateSceneLayers()
		this.rebuildWorldFromNogan()

		const { center } = this.bounds.get()
		const cell = getCell(shared.nogan, cellToComeOutOf)
		if (!cell) {
			console.warn("Couldn't find cell to come out of")
			return
			// throw new Error("Couldn't find cell to come out of")
		}

		const position = add(cell.position, scale(center, CHILD_SCALE))
		const zoomDiff = shared.scene.dom.transform.scale.get().x - ZOOMING_OUT_THRESHOLD
		const zoom = (ZOOMING_OUT_THRESHOLD + zoomDiff) * PARENT_SCALE
		this.dom.transform.scale.set([zoom, zoom])
		this.setCameraCenter(position)
		Tunnel.purgeOtherLevelInfiniteTunnels()
		this.dealWithInfinites()
	}

	rebuildWorldFromNogan() {
		const wireEntities = []

		/** @type { (Entity & {dom: Dom; infinite?: Infinite})[] } */
		const cellEntities = []

		for (const cell of iterateCells(shared.nogan)) {
			if (cell.parent !== shared.level) continue
			const entity = CELL_CONSTRUCTORS[cell.type]({
				id: cell.id,
				position: cell.position,
				template: getTemplate(cell),
			})

			if (!entity) continue
			cellEntities.push(entity)
		}

		for (const wire of iterateWires(shared.nogan)) {
			const cells = wire.cells.map((id) => getCell(shared.nogan, id))
			if (!cells.every((cell) => cell?.parent === shared.level)) continue

			const entity = WIRE_CONSTRUCTOR({
				id: wire.id,
				colour: wire.colour,
				timing: wire.timing,
				source: wire.source,
				target: wire.target,
				preview: false,
			})
			wireEntities.push(entity)
		}

		for (const entity of wireEntities) {
			this.layer.wire.append(entity.dom)
		}

		for (const entity of cellEntities) {
			if (entity instanceof ArrowOfTiming) {
				this.layer.timing.append(entity.dom)
			} else if (entity instanceof ArrowOfColour) {
				this.layer.timing.append(entity.dom)
			} else {
				this.layer.cell.append(entity.dom)
				if (entity.infinite) {
					entity.infinite.background?.dom.style.sendToBack()
					// entity.infinite.dom?.style.bringToFront()
					entity.dom.style.bringToFront()
				}
			}
		}
	}
}

addEventListener("keydown", (e) => {
	if (e.key === "y") {
		const tunnel = Tunnel.get(1)
		const entity = tunnel?.entity
		entity?.dom.transform.setAbsolutePosition([0.001, 0.001])
	}
})
