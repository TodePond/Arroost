import { equals } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { getCell, isFiring, moveCell } from "../../nogan/nogan.js"
import { Carry } from "./carry.js"
import { Component } from "./component.js"
import { Dom } from "./dom.js"
import { Input } from "./input.js"
import { Entity } from "../entities/entity.js"
import { clock } from "../../clock.js"
import { ArrowOfCreation } from "../entities/arrows/creation.js"
import { ArrowOfDummy } from "../entities/arrows/dummy.js"
import { ArrowOfRecording } from "../entities/arrows/recording.js"
import { ArrowOfSlot } from "../entities/arrows/slot.js"
import { ArrowOfDestruction } from "../entities/arrows/destruction.js"
import { ArrowOfConnection } from "../entities/arrows/connection.js"

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
	static apply(func = () => []) {
		const operations = func()
		Tunnel.applyOperations(operations)
		return operations
	}

	/**
	 * Run a function on the nogan - at the nearest beat
	 * @param {() => Operation[]} func
	 * @returns {Promise<Operation[]>}
	 */
	static async perform(func = () => []) {
		if (clock.phase === "aftermath") return Tunnel.apply(func)
		return Tunnel.schedule(func)
	}

	/**
	 * Run a function on the nogan - on the next beat
	 * @param {() => Operation[]} func
	 * @returns {Promise<Operation[]>}
	 */
	static async schedule(func = () => []) {
		return new Promise((resolve) => {
			clock.queue.push(() => {
				const operations = Tunnel.apply(func)
				resolve(operations)
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
	// useCell({ dom, carry, input }) {
	// -------
	// TODO: This will update the position of the cell in the nogan
	// But there's currently nothing that can programmatically move a cell
	// So it's not needed yet
	// -------
	// this.use(() => {
	// 	if (input.state("dragging").active.get()) return
	// 	const position = dom.transform.position.get()
	// 	const velocity = carry?.movement.velocity.get() ?? [0, 0]
	// 	const cell = getCell(shared.nogan, this.id)
	// 	if (equals(cell.position, position)) return
	// 	Tunnel.apply(() => {
	// 		return moveCell(shared.nogan, {
	// 			id: this.id,
	// 			position,
	// 			propogate: equals(velocity, [0, 0]),
	// 			filter: (id) => {
	// 				const cell = getCell(shared.nogan, id)
	// 				return cell.type === "slot"
	// 			},
	// 		})
	// 	})
	// })
	// }

	/**
	 * @param {Partial<CellTemplate>} template
	 */
	applyTemplate(template) {
		// Currently, no cells have any extra properties.
		// So there's nothing to do here!!!
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
	modify: ({ id, template }) => {
		const tunnel = Tunnel.tunnels.get(id)
		if (!tunnel) throw new Error(`Tunnel: Can't modify cell ${id} does not exist`)
		if (template.type !== undefined) {
			const entity = tunnel.entity
			const position = entity.dom.transform.position.get()
			const oldCell = getCell(shared.nogan, id)

			const inputEntities = oldCell.inputs
				.map((input) => Tunnel.tunnels.get(input)?.entity)
				.filter((v) => v)

			const outputEntities = oldCell.outputs
				.map((output) => Tunnel.tunnels.get(output)?.entity)
				.filter((v) => v)

			tunnel.entity.dispose()
			const newEntity = CELL_CONSTRUCTORS[template.type]({ id, position })
			shared.scene.layer.cell.append(newEntity.dom)

			for (const inputEntity of inputEntities) {
				// @ts-expect-error: cant be bothered with type guards
				inputEntity.target = newEntity
				// @ts-expect-error: cant be bothered with type guards
				inputEntity.reusePosition()
			}

			for (const outputEntity of outputEntities) {
				// @ts-expect-error: cant be bothered with type guards
				outputEntity.source = newEntity
				// @ts-expect-error: cant be bothered with type guards
				outputEntity.reusePosition()
			}

			return
		}

		tunnel.applyTemplate(template)
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

/** @type {Record<Cell['type'], (args: any) => Entity & {dom: Dom}>} */
export const CELL_CONSTRUCTORS = {
	creation: ({ id, position }) => new ArrowOfCreation({ id, position }),
	dummy: ({ id, position }) => new ArrowOfDummy({ id, position }),
	recording: ({ id, position }) => new ArrowOfRecording({ id, position }),
	slot: ({ id, position }) => new ArrowOfSlot({ id, position }),
	destruction: ({ id, position }) => new ArrowOfDestruction({ id, position }),
	connection: ({ id, position }) => new ArrowOfConnection({ id, position }),

	time: () => {
		throw new Error("Time cells cannot be created programmatically")
	},
	stopper: () => {
		throw new Error("Stopper cells are unimplemented")
	},
	root: () => {
		throw new Error("Root cells cannot be created")
	},
}
