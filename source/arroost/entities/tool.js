import { distanceBetween, fireEvent } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { iterateCells } from "../../nogan/nogan.js"
import { Tunnel } from "../components/tunnel.js"
import { Pulling } from "../machines/pulling.js"

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
		fireEvent("unlock", { key: type })
		return
	}

	const cell = nearestCell
	const tunnel = Tunnel.tunnels.get(cell.id)
	const entity = tunnel?.entity
	if (!entity) return

	const input = entity.input
	if (!input) return

	const dom = entity.dom
	dom.style.bringToFront()
	entity["source"] = entity.input
	return new Pulling(input, shared.hovering.input.get())
}

export function fireTool(type) {
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
		fireEvent("unlock", { key: type })
		return
	}

	const cell = nearestCell
	const tunnel = Tunnel.tunnels.get(cell.id)
	const entity = tunnel?.entity
	if (!entity) return

	entity["onClick"]?.({ button: 0 })
}
