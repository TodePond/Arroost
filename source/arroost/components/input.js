import { Component } from "./component.js"
import { Entity } from "../entities/entity.js"

export class Input extends Component {
	/**
	 * @param {Entity} entity
	 */
	constructor(entity) {
		super()
		this.entity = entity
	}

	/** @type {null | InputEventHandler} */
	pointerover = null

	/** @type {null | InputEventHandler} */
	pointerout = null

	/** @type {null | InputEventHandler} */
	pointerdown = null

	/** @type {null | InputEventHandler} */
	pointerup = null

	/** @type {null | InputEventHandler} */
	pointermove = null

	/** @type {null | InputEventHandler} */
	wheel = null

	/** @type {null | InputEventHandler} */
	keydown = null

	/** @type {null | InputEventHandler} */
	keyup = null

	/** @param {string} name */
	state(name) {
		if (this[name]) {
			return this[name]
		}

		const active = this.current.get()?.name === name
		const info = { active: this.use(active) }
		this[name] = info
		return info
	}

	/** @type {Signal<any>} */
	current = this.use(null)
}
