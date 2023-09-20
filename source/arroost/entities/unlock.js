import { equals } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { c, iterateCells, t } from "../../nogan/nogan.js"
import { Carry } from "../components/carry.js"
import { Dom } from "../components/dom.js"
import { Creation } from "./cells/creation.js"
import { Destruction } from "./cells/destruction.js"
import { DummyConnection } from "./cells/dummy-connection.js"
import { DummyCreation } from "./cells/dummy-creation.js"
import { DummyWiring } from "./cells/dummy-wiring.js"
import { Entity } from "./entity.js"

/**
 * @typedef {{
 *   unlockable: boolean
 *   unlocked: boolean
 *   remaining: number
 *   create: (arg) => Entity & {dom: Dom, carry: Carry}
 * }} Unlock
 */

export const unlocks = c({
	"dummy-creation": {
		unlockable: true,
		unlocked: true,
		remaining: 0,
		create: (arg) => new DummyCreation(arg),
	},
	"creation": {
		unlockable: false,
		unlocked: true,
		remaining: 3,
		create: (arg) => new Creation(arg),
	},
	"dummy-wiring": {
		unlockable: false,
		unlocked: false,
		remaining: 3,
		create: (arg) => new DummyWiring(arg),
	},
	"dummy-connection": {
		unlockable: true,
		unlocked: true,
		remaining: 3,
		create: (arg) => new DummyConnection(arg),
	},
	"destruction": {
		unlockable: true,
		unlocked: true,
		remaining: 3,
		create: (arg) => new Destruction(arg),
	},
})

/**
 * This type checks the unlocks object.
 * @type {{ [key: string]: Unlock }}
 **/
const _unlocksType = unlocks

/**
 * @param {Entity & {dom: Dom}} [source]
 */
export function replenishUnlocks(source) {
	unlocks: for (const key in unlocks) {
		const unlock = unlocks[key]
		if (!unlock.unlockable) continue unlocks
		if (!unlock.unlocked) {
			if (unlock.remaining <= 0) {
				unlock.unlocked = true
			} else {
				continue unlocks
			}
		}

		cells: for (const cell of iterateCells(shared.nogan)) {
			if (cell.parent !== shared.level) continue cells
			if (cell.type === key) continue unlocks
		}

		const dom = source ? source.dom : null
		const position =
			dom?.transform.position.get() ?? shared.pointer.transform.absolutePosition.get()
		const entity = unlock.create({ position })

		// just in case it doesn't take the position arg
		if (!equals(entity.dom.transform.position.get(), position)) {
			entity.dom.transform.position.set(position)
		}

		const movement = entity.carry.movement
		if (movement) {
			const angle = Math.random() * Math.PI * 2
			const speed = 15
			const velocity = t([Math.cos(angle) * speed, Math.sin(angle) * speed])
			movement.velocity.set(velocity)
		}

		shared.scene.layer.cell.append(entity.dom)
	}
}

/**
 * @param {keyof unlocks} name
 * @param {Entity & {dom: Dom}} source
 */
export function progressUnlock(name, source) {
	const unlock = unlocks[name]
	if (unlock.unlocked) {
		// replenishUnlocks(source)
		return
	}

	unlock.remaining--
	// replenishUnlocks(source)
}
