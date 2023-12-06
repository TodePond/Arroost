import {
	BLUE,
	CYAN,
	GREEN,
	PINK,
	PURPLE,
	RED,
	WHITE,
	YELLOW,
	equals,
} from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { getCell, getWire, isFiring, moveCell } from "../../nogan/nogan.js"
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
import { ArrowOfTiming } from "../entities/arrows/timing.js"
import { ArrowOfColour } from "../entities/arrows/colour.js"
import { ArrowOfReality } from "../entities/arrows/reality.js"

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
	/** @type {Signal<Fire>} */
	fire = this.use({
		red: null,
		green: null,
		blue: null,
	})

	getFire() {
		const cell = getCell(shared.nogan, this.id)
		if (!cell) throw new Error(`Tunnel: Can't find cell ${this.id}`)
		return cell.fire
	}

	isFiring = this.use(() => {
		const fire = this.fire.get()
		for (const key in fire) {
			if (fire[key]) return true
		}
		return false
	}, [this.fire])

	firingColour = this.use(() => {
		const fire = this.fire.get()

		let splash = 0
		if (fire.red) splash += 100
		if (fire.green) splash += 10
		if (fire.blue) splash += 1

		switch (splash) {
			case 0:
				return null
			case 100:
				return RED
			case 10:
				return GREEN
			case 1:
				return BLUE
			case 110:
				return YELLOW
			case 101:
				return PINK
			case 11:
				return CYAN
			case 111:
				return WHITE
		}
	}, [this.fire])

	onFire = () => {}

	/**
	 * @param {CellId | WireId} id
	 * @param {{
	 *   destroyable?: boolean | undefined
	 *   entity: Entity & {dom: Dom; input?: Input; flaps?: ArrowOfTiming; wireColour?: Signal<WireColour>}
	 *   zoomable?: boolean | undefined
	 * }} options
	 **/
	constructor(id, { destroyable, entity, zoomable }) {
		super()
		this.id = id
		this.type = id >= 0 ? "cell" : "wire"
		this.destroyable = destroyable
		this.entity = entity
		this.zoomable = zoomable ?? this.type === "cell"
		Tunnel.set(id, this)
	}

	/**
	 * @param {CellId | WireId} id
	 * @param {Tunnel} tunnel
	 */
	static set(id, tunnel) {
		Tunnel.tunnels.set(id, tunnel)
	}

	/**
	 * @param {CellId | WireId} id
	 */
	static delete(id) {
		Tunnel.tunnels.delete(id)
	}

	/**
	 * @param {CellId | WireId} id
	 * @returns {Tunnel | undefined}
	 */
	static get(id) {
		return Tunnel.tunnels.get(id)
	}

	dispose() {
		super.dispose()
		Tunnel.delete(this.id)
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
	applyCellTemplate(template) {
		// Currently, no cells have any extra properties.
		// So there's nothing to do here!!!
	}

	/**
	 * @param {Partial<{ timing: Timing; colour: WireColour }>} template
	 */
	applyWireTemplate(template) {
		if (template.timing !== undefined) {
			this.entity.flaps?.timing?.set(template.timing)
			return
		}

		if (template.colour !== undefined) {
			this.entity.wireColour?.set(template.colour)
			return
		}
	}
}

const noop = () => {}

/** @type {TunnelMap} */
const TUNNELS = {
	fired: ({ id }) => {
		const tunnel = Tunnel.get(id)
		if (!tunnel) return
		const cell = getCell(shared.nogan, id)
		if (!cell) throw new Error(`Tunnel: Can't find cell ${id}`)
		const wasFiring = tunnel.isFiring.get()
		tunnel.fire.set(cell.fire)
		if (!wasFiring && tunnel.isFiring.get()) {
			tunnel.onFire()
		}
	},
	unfired: ({ id }) => {
		const tunnel = Tunnel.get(id)
		if (!tunnel) return
		const cell = getCell(shared.nogan, id)
		if (!cell) throw new Error(`Tunnel: Can't find cell ${id}`)
		tunnel.fire.set(cell.fire)
	},
	unfire: ({ id, colour }) => {
		const tunnel = Tunnel.get(id)
		if (!tunnel) return
		const cell = getCell(shared.nogan, id)
		if (!cell) throw new Error(`Tunnel: Can't find cell ${id}`)
		tunnel.fire.set(cell.fire)
	},
	modifyWire: ({ id, template }) => {
		const tunnel = Tunnel.get(id)
		if (!tunnel) throw new Error(`Tunnel: Can't find tunnel ${id} to modify`)
		tunnel.applyWireTemplate(template)
	},
	modifyCell: ({ id, template }) => {
		const tunnel = Tunnel.get(id)
		if (!tunnel) throw new Error(`Tunnel: Can't find tunnel ${id} to modify`)
		if (template.type !== undefined) {
			const entity = tunnel.entity
			const position = entity.dom.transform.position.get()
			const oldCell = getCell(shared.nogan, id)
			if (!oldCell) throw new Error(`Tunnel: Can't find cell ${id} to modify`)

			const inputEntities = oldCell.inputs
				.map((input) => Tunnel.get(input)?.entity)
				.filter((v) => v)

			const outputEntities = oldCell.outputs
				.map((output) => Tunnel.get(output)?.entity)
				.filter((v) => v)

			tunnel.entity.dispose()
			const newEntity = CELL_CONSTRUCTORS[template.type]({ id, position, template })
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
		tunnel.applyCellTemplate(template)
	},
	binned: ({ id }) => {
		const tunnel = Tunnel.get(id)
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
	recording: ({ id, position, template }) => {
		return new ArrowOfRecording({ id, position, recordingKey: template.key })
	},
	slot: ({ id, position }) => new ArrowOfSlot({ id, position }),
	destruction: ({ id, position }) => new ArrowOfDestruction({ id, position }),
	connection: ({ id, position }) => new ArrowOfConnection({ id, position }),
	reality: ({ id, position }) => new ArrowOfReality({ id, position }),

	colour: () => {
		throw new Error("Colour cells cannot be created programmatically")
	},

	timing: () => {
		throw new Error("Time cells cannot be created programmatically")
	},

	stopper: () => {
		throw new Error("Stopper cells are unimplemented")
	},

	root: () => {
		throw new Error("Root cells cannot be created")
	},
}
