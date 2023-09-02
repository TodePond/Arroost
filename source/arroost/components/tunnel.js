import { equals } from "../../../libraries/habitat-import.js"
import { msPerBeat, nextBeatQueue } from "../../link.js"
import { shared } from "../../main.js"
import { applyOperations, fireCell, getCell, modifyCell, modifyWire } from "../../nogan/nogan.js"
import { Carry } from "./carry.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"

export const Tunnel = class extends Component {
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

	//==========//
	// INSTANCE //
	//==========//
	// todo: initialise to what the cell/wire currently is
	isFiring = this.use(false)

	/** @param {CellId | WireId} id */
	constructor(id) {
		super()
		this.id = id
		this.isCell = id >= 0
		Tunnel.tunnels.set(id, this)
	}

	dispose() {
		super.dispose()
		Tunnel.tunnels.delete(this.id)
	}

	apply(func) {
		const operations = func()
		Tunnel.applyOperations(operations)
		return operations
	}

	async perform(func) {
		const timeSinceLastBeat = shared.clock.time - shared.clock.lastBeatTime
		const fractionOfBeat = timeSinceLastBeat / msPerBeat()

		if (fractionOfBeat < 0.5) return this.apply(func)

		return new Promise((resolve) => {
			nextBeatQueue.push(() => {
				const operations = this.apply(func)
				resolve(operations)
			})
		})
	}

	/**
	 * Helper function for cells
	 * @param {{
	 * 	dom: Dom
	 * 	carry: Carry
	 * 	input: Input
	 * }} option
	 */
	useCell({ dom, carry, input }) {
		this.use(() => {
			if (input.state("dragging").active) return

			const position = dom.transform.position.get()
			const velocity = carry.movement.velocity.get()
			const cell = getCell(shared.nogan, this.id)
			if (equals(cell.position, position)) return
			this.apply(() => {
				return modifyCell(shared.nogan, {
					id: this.id,
					position,
					propogate: equals(velocity, [0, 0]),
				})
			})
		})
	}
}
