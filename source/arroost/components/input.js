import { Component } from "./component.js"
import { Entity } from "../entities/entity.js"
import { Dom } from "./dom.js"
import { Tunnel } from "./tunnel.js"

export class Input extends Component {
	/**
	 * @param {Entity & {dom: Dom, tunnel?: Tunnel}} entity
	 */
	constructor(entity) {
		super()
		this.entity = entity
	}

	highlighted = this.use(false)
	targeted = this.use(false)

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

	/** @type {null | InputEventHandler} */
	tick = null

	/** @type {null | InputEventHandler} */
	touchend = null

	/** @type {null | InputEventHandler} */
	touchstart = null

	/** @type {null | InputEventHandler} */
	touchmove = null

	/** @type {null | InputEventHandler} */
	touchcancel = null

	/** @param {string} name */
	state(name) {
		if (this[name]) {
			return this[name]
		}

		// Find out the initial state
		const active = this.current.get()?.name === name

		const info = { active: this.use(active) }
		this[name] = info
		return info
	}

	/** @param {string} name */
	is(name) {
		return this.state(name).active.get()
	}

	/** @type {Signal<any>} */
	current = this.use(null)

	isConnectable() {
		const { tunnel } = this.entity
		if (!tunnel) return false
		if (tunnel.type === "wire") return false
		return true
	}

	isCloneable() {
		const { tunnel } = this.entity
		if (!tunnel) return false
		if (tunnel.type === "wire") return false
		return true
	}
}
