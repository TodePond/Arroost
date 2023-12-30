import { scale } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Dragging } from "../machines/input.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"
import { Transform } from "./transform.js"
import { Movement } from "./movement.js"
import { Style } from "./style.js"
import { c, getCell, getTemplate, iterateCells, iterateWires, t } from "../../nogan/nogan.js"
import { CHILD_SCALE, ZOOMING_IN_THRESHOLD, ZOOM_IN_THRESHOLD } from "../unit.js"
import { ArrowOfCreation } from "../entities/arrows/creation.js"
import { CELL_CONSTRUCTORS, WIRE_CONSTRUCTOR } from "./tunnel.js"
import { Entity } from "../entities/entity.js"
import { EASE, lerp } from "../../../libraries/lerp.js"

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
	 * }} options
	 */
	constructor({ dom, isPreview = false }) {
		super()
		this.isPreview = isPreview
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
					const parentOpacity = lerp([100, 0], t, EASE.easeOutExpo)

					const childBlur = lerp([300, 0], t, EASE.easeInOutExpo)
					const parentBlur = lerp([0, 20], t, EASE.easeInOutExpo)

					this.dom?.style.opacity.set(childOpacity)
					this.parent?.style.opacity.set(parentOpacity)

					this.dom?.style.blur.set(childBlur)
					this.parent?.style.blur.set(parentBlur)

					break
				}
				case "none": {
					this.dom?.style.opacity.set(null)
					this.parent?.style.opacity.set(null)

					this.dom?.style.blur.set(null)
					this.parent?.style.blur.set(null)
					break
				}
			}
		}, [this.state, shared.scene.dom.transform.scale])

		this.use(() => {
			switch (this.state.get()) {
				case "zooming-in": {
					this.appendContentsForLevel(shared.level)
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
	 * @param {number} level
	 */
	appendContentsForLevel(level) {
		const cellEntities = []
		const wireEntities = []

		for (const cell of iterateCells(shared.nogan)) {
			if (cell.parent !== level) continue
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
			if (!cells.every((cell) => cell?.parent === level)) continue

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

		for (const entity of wireEntities) {
			this.dom?.append(entity.dom)
		}

		for (const entity of cellEntities) {
			this.dom?.append(entity.dom)
		}
	}
}
