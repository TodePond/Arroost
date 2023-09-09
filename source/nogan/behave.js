import { randomBetween, add } from "../../libraries/habitat-import.js"
import { c, createPeak, getCell, getTemplate, t } from "./nogan.js"

/**
 * The ping pulse is for testing purposes.
 * It triggers a pong operation whenever it spreads.
 * It can be stopped by a stopper cell.
 * @type {Behave<PingPulse>}
 */
const ping = ({ nogan, previous, next, target }) => {
	const targetCell = getCell(nogan, target)
	// Don't spread to 'stopper' cells
	if (targetCell.type === "stopper") return previous

	// Send a pong operation!
	return {
		...next,
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
	const { nogan, source, previous, next, ...rest } = args
	const sourceCell = getCell(nogan, source)
	switch (sourceCell.type) {
		// If the pulse is coming from a creation cell
		// ... turn it into a creation pulse
		case "creation":
			return creation({
				nogan,
				source,
				previous,
				next: {
					...next,
					pulse: c({
						type: "creation",
						template: null,
					}),
				},
				...rest,
			})
		case "destruction":
			return destruction({
				nogan,
				source,
				previous,
				next: {
					...next,
					pulse: c({ type: "destruction" }),
				},
				...rest,
			})
		// case "dummy-creation": {
		// 	const angle = Math.random() * Math.PI * 2
		// 	const distance = randomBetween(15, 30)
		// 	const displacement = t([Math.cos(angle) * distance, Math.sin(angle) * distance])
		// 	const position = add(sourceCell.position, displacement)
		// 	return {
		// 		...next,
		// 		operations: [
		// 			// c({
		// 			// 	type: "create",
		// 			// 	template: c({ type: "dummy" }),
		// 			// 	position,
		// 			// }),
		// 		],
		// 	}
		// }
	}
	return previous.result ? previous : next
}

/**
 * Creation pulses spread until they reach a slot cell.
 * They change the slot cell into the pulse's template.
 * The template changes into any cloneable cell that the pulse travels through.
 * The creation pulse overrides any other pulse.
 * @type {Behave<CreationPulse>}
 */
const creation = (args) => {
	const { nogan, source, target, previous, next } = args
	const sourceCell = getCell(nogan, source)
	const targetCell = getCell(nogan, target)
	// If the target was just created, don't create from it
	if (targetCell.tag.justCreated) return previous

	let template = next.pulse.template
	if (template) {
		// Change the template to any cloneable cell that the pulse travels through
		if (CLONEABLE_CELLS.has(sourceCell.type)) {
			template = getTemplate(sourceCell)
		}
	} else {
		// Set the template to recording if it's not already set
		template = c({ type: "recording" })
	}

	// If the pulse arrives at a slot, create a cell from the template
	if (targetCell.type === "slot") {
		return createPeak({
			operations: [
				c({
					type: "modify",
					id: target,
					template,
				}),
				c({
					type: "tag",
					id: target,
					key: "justCreated",
				}),
			],
		})
	}

	// Otherwise, carry on through
	return c({ ...next, pulse: { ...next.pulse, template }, final: true })
}

/**
 * Destruction pulses spread until they reach a destroyable cell.
 * They change the destroyable cell into a slot cell.
 * @type {Behave<DestructionPulse>}
 */
const destruction = ({ nogan, target, next }) => {
	const targetCell = getCell(nogan, target)

	// If the pulse arrives at a time cell from outside its group, destroy it
	// If the pulse arrives at a timing cell from inside its group, carry on
	if (targetCell.type === "time") {
		// todo
	}

	if (DESTROYABLE_CELLS.has(targetCell.type)) {
		return createPeak({
			operations: [
				c({
					type: "modify",
					id: target,
					template: c({ type: "slot" }),
				}),
			],
		})
	}
	return next
}

const CLONEABLE_CELLS = new Set(["recording", "destruction", "creation"])
const DESTROYABLE_CELLS = new Set(["recording", "destruction", "creation"])

/** @type {BehaviourMap} */
export const BEHAVIOURS = {
	raw,
	ping,
	creation,
	destruction,
}
