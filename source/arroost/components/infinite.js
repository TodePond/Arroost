import { BLACK, RED, rotate, scale } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Dragging } from "../machines/input.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"
import { Transform } from "./transform.js"
import { Movement } from "./movement.js"
import { Style } from "./style.js"
import { c, getCell, getTemplate, iterateCells, iterateWires, t } from "../../nogan/nogan.js"
import {
	CHILD_SCALE,
	FULL,
	PARENT_SCALE,
	ZOOMING_IN_THRESHOLD,
	ZOOM_IN_THRESHOLD,
} from "../unit.js"
import { ArrowOfCreation } from "../entities/arrows/creation.js"
import { CELL_CONSTRUCTORS, Tunnel, WIRE_CONSTRUCTOR } from "./tunnel.js"
import { Entity } from "../entities/entity.js"
import { EASE, lerp } from "../../../libraries/lerp.js"
import { Ellipse } from "../entities/shapes/ellipse.js"
import { ArrowOfConnection } from "../entities/arrows/connection.js"
import { ArrowOfDestruction } from "../entities/arrows/destruction.js"

export function ilerp(x, a, b) {
	return (x - a) / (b - a)
}

export class Infinite extends Component {
	/** @type {Signal<"none" | "zooming-in">} */
	state = this.use("none")

	/**
	 * @param {{
	 * 	dom: Dom
	 * 	isPreview: boolean
	 * 	scale?: [number, number]
	 * }} options
	 */
	constructor({ dom, isPreview = false, scale = t([1, 1]) }) {
		super()
		this.isPreview = isPreview
		this.scale = scale
		if (isPreview) return
		this.parent = dom
		this.dom = new Dom({
			id: "infinite",
			type: "html",
			input: dom.input,
		})

		this.dom.style.zIndex.set(1000)
		this.dom.transform.scale.set([CHILD_SCALE, CHILD_SCALE])

		shared.scene.layer.ghost.append(this.dom)

		this.use(() => {
			if (this.state.get() !== "zooming-in") return
			const position = this.parent?.transform.position.get() ?? [0, 0]
			this.dom?.transform.position.set(position)
		}, [this.state, this.parent?.transform.position])

		this.use(() => {
			switch (this.state.get()) {
				case "zooming-in": {
					const t = ilerp(
						shared.scene.dom.transform.scale.get().x,
						ZOOMING_IN_THRESHOLD,
						ZOOM_IN_THRESHOLD,
					)
					const childOpacity = lerp([0, 100], t)
					const parentOpacity = lerp([100, 0], t, EASE.easeInExpo)

					// const childBlur = lerp([300, 0], t, EASE.easeInOutExpo)
					// const parentBlur = lerp([0, 20], t, EASE.easeInOutExpo)

					this.dom?.style.opacity.set(childOpacity)
					this.parent?.style.opacity.set(parentOpacity)

					// this.dom?.style.blur.set(childBlur)
					// this.parent?.style.blur.set(parentBlur)

					break
				}
				case "none": {
					this.dom?.style.opacity.set(null)
					this.parent?.style.opacity.set(null)

					// this.dom?.style.blur.set(null)
					// this.parent?.style.blur.set(null)
					break
				}
			}
		}, [this.state, shared.scene.dom.transform.scale])

		this.use(() => {
			switch (this.state.get()) {
				case "zooming-in": {
					if (!this.dom?.input.entity?.tunnel) throw new Error("Missing tunnel")
					const tunnel = this.dom.input.entity.tunnel
					this.appendContentsForLevel(tunnel.id)
					break
				}
				case "none": {
					this.dom?.clear()
					this.disposePreviews()
					break
				}
			}
		}, [this.state])
	}

	/** @type {Set<Entity>} */
	previews = new Set()

	disposePreviews() {
		for (const preview of this.previews) {
			preview.dispose()
		}
		this.previews.clear()
	}

	/**
	 * @param {number} newLevel
	 */
	appendContentsForLevel(newLevel) {
		const cellEntities = []
		const wireEntities = []

		const oldLevelCell = getCell(shared.nogan, shared.level)
		const newLevelCell = getCell(shared.nogan, newLevel)

		if (!oldLevelCell || !newLevelCell) {
			throw new Error("Missing level cell - this shouldn't happen")
		}

		for (const cell of iterateCells(shared.nogan)) {
			if (cell.parent !== newLevel) continue
			const entity = CELL_CONSTRUCTORS[cell.type]({
				id: cell.id,
				position: cell.position,
				template: getTemplate(cell),
				preview: true,
			})
			// const entity = new ArrowOfCreation({
			// 	id: cell.id,
			// 	position: scale(cell.position, 1),
			// 	preview: true,
			// })
			if (entity) {
				cellEntities.push(entity)
				this.previews.add(entity)
			}
		}

		for (const wire of iterateWires(shared.nogan)) {
			const cells = wire.cells.map((id) => getCell(shared.nogan, id))
			if (!cells.every((cell) => cell?.parent === newLevel)) continue

			const entity = WIRE_CONSTRUCTOR({
				id: wire.id,
				colour: wire.colour,
				timing: wire.timing,
				source: wire.source,
				target: wire.target,
				preview: true,
			})

			if (entity) {
				wireEntities.push(entity)
				this.previews.add(entity)
			}
		}

		if (cellEntities.length === 0) {
			const distance = FULL * 2
			const angle = Math.random() * Math.PI * 2

			/** @type {[number, number][]} */
			const positions = [rotate([distance, 0], angle), rotate([-distance, 0], angle)]

			const entity1 = new ArrowOfCreation({
				position: positions[0],
				preview: true,
				level: newLevel,
			})
			cellEntities.push(entity1)
			this.previews.add(entity1)

			const entity2 = new ArrowOfConnection({
				position: positions[1],
				preview: true,
				level: newLevel,
			})
			cellEntities.push(entity2)
			this.previews.add(entity2)

			// const entity3 = new ArrowOfDestruction({
			// 	position: positions[2],
			// 	preview: true,
			// 	level: newLevel,
			// })
			// cellEntities.push(entity3)
			// this.previews.add(entity3)
		}

		const background = new Ellipse()
		this.background = background
		background.dom.style.fill.set(BLACK.toString())

		const parent = this.parent
		if (!parent) throw new Error("Missing parent")
		background.dom.transform.scale.set(this.scale)
		this.use(() => {
			background.dom.transform.position.set(parent.transform.position.get() ?? [0, 0])
		}, [parent.transform.position])

		this.previews.add(background)

		shared.scene.layer.cell.append(background.dom)

		for (const entity of wireEntities) {
			this.dom?.append(entity.dom)
		}

		for (const entity of cellEntities) {
			this.dom?.append(entity.dom)
		}

		parent.style.bringToFront()
	}
}
