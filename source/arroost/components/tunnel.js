import { applyOperations } from "../../nogan/nogan.js"
import { Component } from "./component.js"

export const Tunnel = class extends Component {
	//==========//
	// INSTANCE //
	//==========//
	fire = {
		red: this.use(false),
		green: this.use(false),
		blue: this.use(false),
	}

	isFiring = this.use(() => this.fire.red.get() || this.fire.green.get() || this.fire.blue.get())

	/** @param {CellId | WireId} id */
	constructor(id) {
		super()
		this.id = id
		Tunnel.tunnels.set(id, this)
	}

	dispose() {
		super.dispose()
		Tunnel.tunnels.delete(this.id)
	}

	//========//
	// STATIC //
	//========//
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
