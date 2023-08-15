import { Component } from "./component.js"
import { shared } from "../../main.js"
import { c, createCell } from "../../nogan/nogan.js"
import { Dom } from "./dom.js"

export const Tunnel = class extends Component {
	/**
	 * @param {{
	 * 	id: CellId | WireId
	 * 	dom: Dom
	 * }} options
	 */
	constructor({ id, dom }) {
		super()
		this.id = id
		this.dom = dom
		Tunnel.tunnels.set(id, this)
	}

	dispose() {
		super.dispose()
		Tunnel.tunnels.delete(this.id)
	}

	static tunnels = new Map()

	/**
	 * @param {Operation[]} operations
	 */
	static applyOperations(operations) {
		for (const operation of operations) {
			Tunnel.applyOperation(operation)
		}
	}

	/**
	 * @param {Operation} operation
	 */
	static applyOperation(operation) {
		switch (operation.type) {
			case "fired": {
				// ...
				return
			}
			case "modify": {
				// ...
				return
			}
			case "pong": {
				// ...
				return
			}
		}
	}
}
