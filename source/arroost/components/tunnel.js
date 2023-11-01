import { equals } from "../../../libraries/habitat-import.js"
import { msPerBeat, nextBeatQueue } from "../../link.js"
import { shared } from "../../main.js"
import { getCell, moveCell } from "../../nogan/nogan.js"
import { Carry } from "./carry.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"
import { Entity } from "../entities/entity.js"

export class Tunnel extends Component {
	//========//
	// STATIC //
	//========//
	/**
	 * @type {Map<number, Tunnel>}
	 */
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
		const tunnelFunction = TUNNELS[operation.type]
		// @ts-expect-error: freaks out
		tunnelFunction(operation)
	}

	/**
	 * Run a function on the nogan - right now
	 * @param {() => Operation[]} func
	 * @returns {Operation[]}
	 */
	static apply(func) {
		const operations = func()
		Tunnel.applyOperations(operations)
		return operations
	}

	/**
	 * Run a function on the nogan - at the nearest beat
	 * @param {() => Operation[]} func
	 * @returns {Promise<Operation[]>}
	 */
	static async perform(func) {
		const timeSinceLastBeat = shared.clock.time - shared.clock.lastBeatTime
		const fractionOfBeat = timeSinceLastBeat / msPerBeat()

		if (fractionOfBeat < 0.5) return this.apply(func)
		return this.schedule(func)
	}

	/**
	 * Run a function on the nogan - on the next beat
	 * @param {() => Operation[]} func
	 * @param {number} [beats] - How many beats to wait
	 * @returns {Promise<Operation[]>}
	 */
	static async schedule(func, beats = 0) {
		if (beats <= 0) {
			return new Promise((resolve) => {
				nextBeatQueue.current.push(() => {
					const operations = this.apply(func)
					resolve(operations)
				})
			})
		}

		return new Promise((resolve) => {
			nextBeatQueue.current.push(() => {
				this.schedule(func, beats - 1)
				resolve([])
			})
		})
	}

	//==========//
	// INSTANCE //
	//==========//
	// todo: initialise to what the cell/wire currently is
	isFiring = this.use(false)

	onFire = () => {}

	/**
	 * @param {CellId | WireId} id
	 * @param {{
	 *   concrete?: boolean
	 *   destroyable?: boolean | undefined
	 *   entity: Entity & {dom: Dom; input?: Input}
	 * }} options
	 **/
	constructor(id, { concrete = true, destroyable, entity }) {
		super()
		this.id = id
		this.type = id >= 0 ? "cell" : "wire"
		this.concrete = concrete
		this.destroyable = destroyable
		this.entity = entity
		Tunnel.tunnels.set(id, this)
	}

	dispose() {
		super.dispose()
		Tunnel.tunnels.delete(this.id)
	}

	/**
	 * Helper function for cells
	 * @param {{
	 * 	dom: Dom
	 * 	carry?: Carry
	 * 	input: Input
	 * }} option
	 */
	useCell({ dom, carry, input }) {
		this.use(() => {
			if (input.state("dragging").active.get()) return

			const position = dom.transform.position.get()
			const velocity = carry?.movement.velocity.get() ?? [0, 0]
			const cell = getCell(shared.nogan, this.id)
			if (equals(cell.position, position)) return
			Tunnel.apply(() => {
				return moveCell(shared.nogan, {
					id: this.id,
					position,
					propogate: equals(velocity, [0, 0]),
					filter: (id) => {
						const cell = getCell(shared.nogan, id)
						return cell.type === "slot"
					},
				})
			})
		})
	}
}

const noop = () => {}

/** @type {TunnelMap} */
const TUNNELS = {
	fired: ({ id }) => {
		const tunnel = Tunnel.tunnels.get(id)
		if (!tunnel) return
		tunnel.isFiring.set(true)
		tunnel.onFire()
	},
	unfired: ({ id }) => {
		const tunnel = Tunnel.tunnels.get(id)
		if (!tunnel) return
		tunnel.isFiring.set(false)
	},
	modify: ({ id, ...template }) => {
		// todo
	},
	binned: ({ id }) => {
		const tunnel = Tunnel.tunnels.get(id)
		if (!tunnel) return
		tunnel.entity.dispose()
	},
	moved: noop,
	pong: noop,
	tag: noop,
}
