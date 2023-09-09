import { shared } from "../../main.js"
import { c, iterateCells, t } from "../../nogan/nogan.js"
import { Entity } from "./entity.js"
import { DummyCreation } from "./cells/dummy-creation.js"
import { equals, randomBetween } from "../../../libraries/habitat-import.js"
import { Creation } from "./cells/creation.js"

export const unlocks = {
	"dummy-creation": {
		unlocked: true,
		create: (arg) => new DummyCreation(arg),
	},
	"creation": {
		unlocked: true,
		remaining: 5,
		create: (arg) => new Creation(arg),
	},
}

/**
 * @param {Entity} [source]
 */
export function replenishUnlocks(source) {
	unlocks: for (const key in unlocks) {
		const unlock = unlocks[key]
		if (!unlock.unlocked) continue unlocks

		cells: for (const cell of iterateCells(shared.nogan)) {
			if (cell.parent !== shared.level) continue cells
			if (cell.type === key) continue unlocks
		}

		const dom = source ? source["dom"] : shared.scene.layer.cell
		const position = dom.transform.position.get()
		const entity = unlock.create({ position })

		// just in case it doesn't take the position arg
		if (!equals(entity.dom.transform.position.get(), position)) {
			entity.dom.transform.position.set(position)
		}

		const movement = entity.carry?.movement ?? entity.movement
		if (movement) {
			const angle = Math.random() * Math.PI * 2
			const speed = 15
			const velocity = t([Math.cos(angle) * speed, Math.sin(angle) * speed])
			movement.velocity.set(velocity)
		}

		shared.scene.layer.cell.append(entity.dom)
	}
}
