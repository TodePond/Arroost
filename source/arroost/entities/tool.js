import { distanceBetween, fireEvent } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { iterateCells } from "../../nogan/nogan.js"
import { Tunnel } from "../components/tunnel.js"
import { Pulling } from "../machines/pulling.js"
import { replenishUnlocks, unlocks } from "./unlock.js"

/**
 * @param {Cell['type']} type
 */
export function selectTool(type) {
	const pointer = shared.pointer.transform.absolutePosition.get()
	let nearestCell = undefined
	let nearestDistance = Infinity
	for (const cell of iterateCells(shared.nogan)) {
		if (cell.type !== type) continue
		const distance = distanceBetween(cell.position, pointer)
		if (distance < nearestDistance) {
			nearestDistance = distance
			nearestCell = cell
		}
	}

	if (!nearestCell) {
		unlocks[type].unlocked = true
		replenishUnlocks(true)
		// fireEvent("unlock", { key: type })
		return selectTool(type)
	}

	const cell = nearestCell
	const tunnel = Tunnel.get(cell.id)
	const entity = tunnel?.entity
	if (!entity) return

	const input = entity.input
	if (!input) return

	const dom = entity.dom
	dom.style.bringToFront()
	entity["source"] = entity.input
	return new Pulling(input, shared.hovering.input.get())
}

export function fireTool(type, giveUp = false) {
	const pointer = shared.pointer.transform.absolutePosition.get()
	let nearestCell = undefined
	let nearestDistance = Infinity
	for (const cell of iterateCells(shared.nogan)) {
		if (cell.type !== type) continue
		const distance = distanceBetween(cell.position, pointer)
		if (distance < nearestDistance) {
			nearestDistance = distance
			nearestCell = cell
		}
	}

	if (giveUp) return

	if (!nearestCell) {
		unlocks[type].unlocked = true
		replenishUnlocks(true)
		// fireEvent("unlock", { key: type })
		return fireTool(type, true)
	}

	const cell = nearestCell
	const tunnel = Tunnel.get(cell.id)
	const entity = tunnel?.entity
	if (!entity) return

	entity["onClick"]?.({ button: 0 })
}
