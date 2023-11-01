import { angleBetween, equals, oneIn, randomBetween } from "../../../libraries/habitat-import.js"
import { msPerBeat } from "../../link.js"
import { shared } from "../../main.js"
import { c, iterateCells, t } from "../../nogan/nogan.js"
import { Carry } from "../components/carry.js"
import { Dom } from "../components/dom.js"
import { Tunnel } from "../components/tunnel.js"
import { HALF } from "../unit.js"
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
		unlockable: false,
		unlocked: true,
		remaining: 0,
		create: (arg) => new DummyCreation(arg),
	},
	"creation": {
		unlockable: true,
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
		unlocked: false,
		remaining: 2,
		create: (arg) => new DummyConnection(arg),
	},
	"destruction": {
		unlockable: true,
		unlocked: false,
		remaining: 1,
		create: (arg) => new Destruction(arg),
	},
})

/**
 * This type checks the unlocks object.
 * @type {{ [key: string]: Unlock }}
 **/
const _unlocksType = unlocks

export function replenishUnlocks(immediately = false) {
	const caller = immediately ? Tunnel.apply.bind(Tunnel) : Tunnel.schedule.bind(Tunnel)

	caller(() => {
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

			const { position } = getRandomSpawnPosition()
			const entity = unlock.create({ position })

			// just in case it doesn't take the position arg
			// if (!equals(entity.dom.transform.position.get(), position)) {
			entity.dom.transform.setAbsolutePosition(position)
			// }

			const movement = entity.carry.movement
			if (movement) {
				const angle = angleBetween(position, shared.scene.bounds.get().center)
				// const angle = Math.random() * Math.PI * 2
				const speed = -30
				const velocity = t([Math.cos(angle) * speed, Math.sin(angle) * speed])
				// movement.velocity.set(velocity)
				movement.setAbsoluteVelocity(velocity)
			}

			shared.scene.layer.cell.append(entity.dom)
		}
		return []
	})
}

function getRandomSpawnPosition() {
	const bounds = shared.scene.bounds.get()
	const axis = oneIn(2) ? "y" : "x"

	if (axis === "y") {
		const y = oneIn(2) ? bounds.top - HALF : bounds.bottom + HALF
		const x = randomBetween(bounds.left, bounds.right)
		return { position: [x, y] }
	} else {
		const x = oneIn(2) ? bounds.left - HALF : bounds.right + HALF
		const y = randomBetween(bounds.top, bounds.bottom)
		return { position: [x, y] }
	}
}

/**
 * @param {keyof unlocks} name
 */
export function progressUnlock(name) {
	const unlock = unlocks[name]
	if (unlock.unlocked) {
		// replenishUnlocks()
		return
	}

	unlock.remaining--
	replenishUnlocks()
}

addEventListener("unlock", (e) => {
	const unlock = unlocks[e["key"]]
	unlock.unlocked = true
	replenishUnlocks()
})
