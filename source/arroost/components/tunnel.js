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
	scale,
	subtract,
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
import { ArrowOfDefinition } from "../entities/arrows/definition.js"
import { Infinite } from "./infinite.js"
import { Marker } from "../entities/debug/marker.js"
import { PARENT_SCALE } from "../unit.js"
import { ArrowOfTime } from "../entities/arrows/time.js"

export class Tunnel extends Component {
	//========//
	// STATIC //
	//========//
	/**
	 * @type {Map<number, Tunnel>}
	 */
	static tunnels = new Map()

	/**
	 * @type {Set<Tunnel & {entity: { infinite: Infinite}}>}
	 */
	static inViewInfiniteTunnels = new Set()

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
	 *   entity: Entity & {
	 * 		dom: Dom;
	 * 		input?: Input;
	 * 		flaps?: ArrowOfTiming;
	 * 		wireColour?: Signal<WireColour>;
	 * 		carry?: Carry;
	 * 		infinite?: Infinite;
	 * 	 }
	 * }} options
	 **/
	constructor(id, { destroyable, entity }) {
		super()
		this.id = id
		this.type = id >= 0 ? "cell" : "wire"
		this.destroyable = destroyable
		this.entity = entity
		this.isInfinite = entity.infinite !== undefined
		this.isPreview = entity.infinite?.isPreview ?? false

		// Todo: Registered tunnels should be an array of entities, not a single entity
		if (!this.isPreview) {
			Tunnel.set(id, this)
		}

		if (!(this.entity.dom instanceof Dom)) {
			throw new Error(`Tunnel: Entity must have Dom component`)
		}

		if (this.isInfinite && !this.isPreview) {
			this.use(() => {
				if (this.entity.dom.outOfView.get()) {
					// @ts-expect-error: i promise not to remove components
					Tunnel.inViewInfiniteTunnels.delete(this)
				} else {
					// @ts-expect-error: i promise not to remove components
					Tunnel.inViewInfiniteTunnels.add(this)
				}
			}, [this.entity.dom.outOfView])
		}

		if (this.type === "cell") {
			this.useCell({
				dom: this.entity.dom,
				carry: this.entity.carry,
				input: this.entity.input,
			})
		}
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
		const tunnel = Tunnel.get(id)
		if (!tunnel) throw new Error(`Tunnel: Can't find tunnel ${id} to delete`)
		Tunnel.tunnels.delete(id)
		// @ts-expect-error: i promise not to remove components
		Tunnel.inViewInfiniteTunnels.delete(tunnel)
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
		if (this.isPreview) return
		Tunnel.delete(this.id)
	}

	/**
	 * Helper function for cells
	 * @param {{
	 * 	dom: Dom
	 * 	carry?: Carry
	 * 	input?: Input
	 * }} option
	 */
	useCell({ dom, carry, input }) {
		this.use(() => {
			if (input?.state("dragging").active.get()) return
			const position = dom.transform.absolutePosition.get()
			const velocity = carry?.movement.velocity.get() ?? [0, 0]
			const cell = getCell(shared.nogan, this.id)
			if (!cell) throw new Error(`Tunnel: Can't find cell ${this.id}`)
			if (equals(cell.position, position)) return
			Tunnel.apply(() => {
				return moveCell(shared.nogan, {
					id: this.id,
					position,
					propogate: equals(velocity, [0, 0]),
					filter: (id) => {
						const cell = getCell(shared.nogan, id)
						if (!cell) throw new Error(`Tunnel: Can't find cell ${id}`)
						return cell.type === "slot"
					},
				})
			})
		})
	}

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
			if (!newEntity) return
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

/** @type {Record<Cell['type'], (args: any) => (Entity & {dom: Dom}) | null>} */
export const CELL_CONSTRUCTORS = {
	creation: ({ id, position, preview }) => new ArrowOfCreation({ id, position, preview }),
	dummy: ({ id, position, preview }) => new ArrowOfDummy({ id, position, preview }),
	recording: ({ id, position, template, preview }) => {
		return new ArrowOfRecording({ id, position, recordingKey: template.key, preview })
	},
	slot: ({ id, position, preview }) => new ArrowOfSlot({ id, position, preview }),
	destruction: ({ id, position, preview }) => new ArrowOfDestruction({ id, position, preview }),
	connection: ({ id, position, preview }) => new ArrowOfConnection({ id, position, preview }),
	reality: ({ id, position, preview }) => new ArrowOfReality({ id, position, preview }),
	definition: ({ id, position, preview }) => {
		return new ArrowOfDefinition({ id, position, preview })
	},

	colour: () => {
		return null
		throw new Error("Colour cells cannot be created programmatically")
	},

	timing: () => {
		return null
		throw new Error("Time cells cannot be created programmatically")
	},

	stopper: () => {
		throw new Error("Stopper cells are unimplemented")
	},

	root: () => {
		// const centerMarker = new Marker()
		// centerMarker.dom.transform.setAbsolutePosition([0, 0])

		// const cameraCenterMarker = new Marker()
		// // shared.scene.layer.ghost.append(cameraCenterMarker.dom)
		// let i = 0
		// cameraCenterMarker.use(() => {
		// 	const center = shared.scene.bounds.get().center
		// 	const target = shared.scene.infiniteTarget.get()
		// 	if (!target) return

		// 	const sceneScale = shared.scene.dom.transform.scale.get().x
		// 	const targetPosition = target.dom.transform.absolutePosition.get()

		// 	const position = scale(subtract(center, targetPosition), PARENT_SCALE)

		// 	cameraCenterMarker.dom.transform.position.set(position)

		// 	// const scale = shared.scene.dom.transform.scale.get().x
		// 	// cameraCenterMarker.dom.transform.scale.set([(1 / scale) * 0.5, (1 / scale) * 0.5])
		// }, [shared.scene.bounds, shared.scene.infiniteTarget])

		// return cameraCenterMarker

		// Don't need to do anything for this!
		return null
	},
}

export const WIRE_CONSTRUCTOR = ({ id, colour, timing, source, target, preview }) => {
	// const targetEntity

	return new ArrowOfTime({
		id,
		colour,
		timing,
		source,
		target,
		preview,
	})
}
