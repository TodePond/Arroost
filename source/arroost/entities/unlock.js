import { shared } from "../../main.js"
import { c, iterateCells } from "../../nogan/nogan.js"
import { Dom } from "../components/dom.js"
import { DummyCreation } from "./cells/dummy-creation.js"

const unlocks = {
	"dummy-creation": {
		status: "unlocked",
		entity: DummyCreation,
	},
	"creation": {
		status: "locked",
		remaining: 5,
	},
}

/**
 * @param {Dom} [source]
 */
export function replenishUnlocks(source) {
	unlocks: for (const key in unlocks) {
		const unlock = unlocks[key]
		if (unlock.status === "locked") continue unlocks

		cells: for (const cell of iterateCells(shared.nogan)) {
			if (cell.parent !== shared.level) continue cells
			if (cell.type === key) continue unlocks
		}

		const position = source ? source.transform.position.get() : [0, 0]
		const entity = new unlock.entity({ position })
		shared.scene.layer.cell.append(entity.dom)
	}
}
