import { lerp, scale } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Dragging } from "../machines/input.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"
import { Transform } from "./transform.js"
import { Movement } from "./movement.js"
import { Style } from "./style.js"
import { c, getTemplate, iterateCells, t } from "../../nogan/nogan.js"
import { CHILD_SCALE, ZOOMING_IN_THRESHOLD, ZOOM_IN_THRESHOLD } from "../unit.js"
import { ArrowOfCreation } from "../entities/arrows/creation.js"
import { CELL_CONSTRUCTORS } from "./tunnel.js"

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

		this.parent.append(this.dom)

		this.use(() => {
			switch (this.state.get()) {
				case "zooming-in": {
					const t = ilerp(
						shared.scene.dom.transform.scale.get().x,
						ZOOMING_IN_THRESHOLD,
						ZOOM_IN_THRESHOLD,
					)
					const opacity = lerp([0, 100], t)
					this.dom?.style.opacity.set(opacity)
					break
				}
				case "none": {
					this.dom?.style.opacity.set(null)
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
					break
				}
			}
		}, [this.state])
	}

	/**
	 * @param {number} level
	 */
	appendContentsForLevel(level) {
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
			if (entity) this.dom?.append(entity.dom)
		}
	}
}
