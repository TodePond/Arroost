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
	if (target.tag.justCreated) {
		return previous
	}

	if (previous.result) {
		if (FINAL_PULSES.has(previous.pulse.type)) {
			return previous
		}
	}

	let template = next.pulse.template
	if (template) {
		if (CLONEABLE_CELLS.has(source.type)) {
			template = getTemplate(source)
		}
	} else {
		template = c({ type: "recording" })
	}

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
	return { ...next, pulse: { ...next.pulse, template } }
}

const CLONEABLE_CELLS = new Set(["recording", "destruction", "creation"])
const FINAL_PULSES = new Set(["creation", "destruction"])

/** @type {BehaviourMap} */
export const BEHAVIOURS = {
	raw,
	ping,
	creation,
	destruction: noop,
}
