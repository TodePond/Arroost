import { randomBetween, add } from "../../libraries/habitat-import.js"
import { c, createPeak, getCell, getTemplate, getWire, t } from "./nogan.js"

/**
 * The ping pulse is for testing purposes.
 * It triggers a pong operation whenever it spreads.
 * It can be stopped by a stopper cell.
 * @type {Behave<PingPulse>}
 */
const ping = ({ nogan, previous, peak, target }) => {
	const targetCell = getCell(nogan, target)
	if (!targetCell) throw new Error(`Couldn't find cell ${target} to ping`)

	// Don't spread to 'stopper' cells
	if (targetCell.type === "stopper") return previous

	// Send a pong operation!
	return {
		...peak,
		operations: [c({ type: "pong" })],
	}
}

/**
 * Raw pulses don't override any other pulse.
 * They only spread to cells with no pulse.
 * Certain cell types can change it into different kinds of pulses.
 * @type {Behave<RawPulse>}
 */
const raw = (args) => {
	const { nogan, source, previous, peak, target } = args
	const sourceCell = getCell(nogan, source)
	if (!sourceCell) throw new Error(`Couldn't find source cell ${source}`)
	switch (sourceCell.type) {
		// If the pulse is coming from a creation cell
		// ... turn it into a creation pulse
		case "creation": {
			return creation({
				nogan,
				source,
				previous,
				target,
				peak: {
					...peak,
					pulse: c({
						type: "creation",
						template: null,
					}),
				},
			})
		}
		case "destruction": {
			return destruction({
				nogan,
				source,
				previous,
				target,
				peak: {
					...peak,
					pulse: c({ type: "destruction" }),
				},
			})
		}
	}

	const targetCell = getCell(nogan, target)
	if (!targetCell) throw new Error(`Couldn't find target cell ${target}`)

	switch (targetCell.type) {
		case "reality": {
			const pulse = targetCell.fire[peak.colour]
			if (!pulse) return peak
			return {
				...peak,
				operations: [
					c({
						type: "unfire",
						id: target,
						colour: peak.colour,
					}),
				],
			}
		}
		case "timing": {
			const wire = getWire(nogan, targetCell.wire)
			if (!wire) throw new Error(`Couldn't find wire ${targetCell.wire}`)
			return {
				...peak,
				operations: [
					c({
						type: "modifyWire",
						id: wire.id,
						template: c({
							timing: getNextTiming(wire.timing),
						}),
					}),
				],
			}
		}
		case "colour": {
			const wire = getWire(nogan, targetCell.wire)
			if (!wire) throw new Error(`Couldn't find wire ${targetCell.wire}`)
			return {
				...peak,
				operations: [
					c({
						type: "modifyWire",
						id: wire.id,
						template: c({
							colour: getNextColour(wire.colour),
						}),
					}),
				],
			}
		}
	}

	return peak
}

/**
 * @param {Timing} timing
 * @returns {Timing}
 */
export const getNextTiming = (timing) => {
	switch (timing) {
		case -1:
			return 0
		case 0:
			return 1
		case 1:
			return -1
	}
}

/**
 *
 * @param {WireColour} colour
 * @returns
 */
export const getNextColour = (colour) => {
	switch (colour) {
		case "any":
			return "red"
		case "red":
			return "green"
		case "green":
			return "blue"
		case "blue":
			return "any"
	}
}

/**
 * Creation pulses spread until they reach a slot cell.
 * They change the slot cell into the pulse's template.
 * The template changes into any cloneable cell that the pulse travels through.
 * The creation pulse overrides any other pulse.
 * @type {Behave<CreationPulse>}
 */
const creation = (args) => {
	const { nogan, source, target, previous, peak } = args
	const sourceCell = getCell(nogan, source)
	const targetCell = getCell(nogan, target)

	if (!sourceCell) throw new Error(`Couldn't find source cell ${source}`)
	if (!targetCell) throw new Error(`Couldn't find target cell ${target}`)

	// If the target was just created, don't create from it
	if (targetCell.tag.justCreated) return previous

	let template = peak.pulse.template
	if (template) {
		// Change the template to any cloneable cell that the pulse travels through
		if (CLONEABLE_CELLS.has(sourceCell.type)) {
			template = getTemplate(sourceCell)
		}
	} else {
		// Set the template to recording if it's not already set
		template = c({ type: "recording", key: null })
	}

	// If the pulse arrives at a slot, create a cell from the template
	if (targetCell.type === "slot") {
		return createPeak({
			colour: peak.colour,
			operations: [
				c({
					type: "modifyCell",
					id: target,
					template,
				}),
				c({
					type: "tag",
					id: target,
					key: "justCreated",
				}),
			],
			pulse: {
				type: "raw",
			},
		})
	}

	// Otherwise, carry on through
	return c({ ...peak, pulse: { ...peak.pulse, template }, final: true })
}

/**
 * Destruction pulses spread until they reach a destroyable cell.
 * They change the destroyable cell into a slot cell.
 * @type {Behave<DestructionPulse>}
 */
const destruction = ({ nogan, target, peak }) => {
	const targetCell = getCell(nogan, target)
	if (!targetCell) throw new Error(`Couldn't find target cell ${target}`)

	if (DESTROYABLE_CELLS.has(targetCell.type)) {
		return createPeak({
			colour: peak.colour,
			operations: [
				c({
					type: "modifyCell",
					id: target,
					template: c({ type: "slot" }),
				}),
			],
		})
	}
	return peak
}

const CLONEABLE_CELLS = new Set(["recording", "destruction", "creation", "reality"])
const DESTROYABLE_CELLS = new Set([
	"recording",
	"destruction",
	"creation",
	"connection",
	"reality",
])

/** @type {BehaviourMap} */
export const BEHAVIOURS = {
	raw,
	ping,
	creation,
	destruction,
}
