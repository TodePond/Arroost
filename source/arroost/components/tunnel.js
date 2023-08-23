import { msPerBeat, nextBeatQueue } from "../../link.js"
import { shared } from "../../main.js"
import { applyOperations, fireCell } from "../../nogan/nogan.js"
import { Component } from "./component.js"

export const Tunnel = class extends Component {
	//==========//
	// INSTANCE //
	//==========//
	// todo: initialise to what the cell/wire currently is
	isFiring = this.use(false)

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
				const tunnel = Tunnel.tunnels.get(operation.id)
				tunnel.isFiring.set(true)
				return
			}
			case "unfired": {
				const tunnel = Tunnel.tunnels.get(operation.id)
				tunnel.isFiring.set(false)
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

	fire() {
		const timeSinceLastBeat = shared.clock.time - shared.clock.lastBeatTime
		const fractionOfBeat = timeSinceLastBeat / msPerBeat()
		if (fractionOfBeat < 0.5) {
			const operations = fireCell(shared.nogan, { id: this.id })
			Tunnel.applyOperations(operations)
		} else {
			nextBeatQueue.push(() => {
				const operations = fireCell(shared.nogan, { id: this.id })
				Tunnel.applyOperations(operations)
			})
			Tunnel.applyOperations([{ type: "fired", id: this.id }])
		}
	}
}
