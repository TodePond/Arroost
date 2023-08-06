import { c, createPeak, getTemplate } from "./nogan.js"

/**
 * Placeholder: Just override the previous pulse.
 * @type {Behave<Pulse>}
 */
const noop = ({ next }) => {
	return next
}

/**
 * The ping pulse is for testing purposes.
 * It triggers a pong operation whenever it spreads.
 * It can be stopped by a stopper cell.
 * @type {Behave<PingPulse>}
 */
const ping = ({ previous, next, target }) => {
	// Don't spread to 'stopper' cells
	if (target.type === "stopper") return previous

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
const raw = ({ source, target, previous, next }) => {
	switch (source.type) {
		// If the pulse is coming from a creation cell
		// ... turn it into a creation pulse
		case "creation":
			return creation({
				source,
				target,
				previous,
				next: {
					...next,
					pulse: c({
						type: "creation",
						template: null,
					}),
				},
			})
		case "destruction":
			return destruction({
				source,
				target,
				previous,
				next: {
					...next,
					pulse: c({ type: "destruction" }),
				},
			})
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
const creation = ({ source, target, previous, next }) => {
	// If the target was just created, don't create from it
	if (target.tag.justCreated) return previous

	let template = next.pulse.template
	if (template) {
		// Change the template to any cloneable cell that the pulse travels through
		if (CLONEABLE_CELLS.has(source.type)) {
			template = getTemplate(source)
		}
	} else {
		// Set the template to recording if it's not already set
		template = c({ type: "recording" })
	}

	// If the pulse arrives at a slot, create a cell from the template
	if (target.type === "slot") {
		return createPeak({
			operations: [
				c({
					type: "modify",
					id: target.id,
					template,
				}),
				c({
					type: "tag",
					id: target.id,
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
const destruction = ({ target, next }) => {
	if (DESTROYABLE_CELLS.has(target.type)) {
		return createPeak({
			operations: [
				c({
					type: "modify",
					id: target.id,
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
