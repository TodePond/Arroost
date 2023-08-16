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

	hovering = this.use(false)
	pointing = this.use(false)
	dragging = this.use(false)
}
