import { c, getTemplate } from "./nogan.js"

/**
 * Placeholder: Just override the previous pulse.
 * @type {Behaviour<Pulse>}
 */
const override = ({ next }) => {
	return next
}

/**
 * The ping pulse is for testing purposes.
 * It triggers a pong operation whenever it spreads.
 * It can be stopped by a stopper cell.
 * @type {Behaviour<PingPulse>}
 */
const ping = ({ previous, next, target }) => {
	if (target.type === "stopper") return previous
	if (previous.result && previous.pulse.type === "ping") {
		return previous
	}
	const operation = c({ type: "pong" })
	return {
		...next,
		operations: [operation],
	}
}

/**
 * Raw pulses don't override any other pulse.
 * They only spread to cells with no pulse.
 * Certain cell types can change it into different kinds of pulses.
 * @type {Behaviour<RawPulse>}
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
 * @type {Behaviour<CreationPulse>}
 */
const creation = ({ source, target, next }) => {
	let template = next.pulse.template
	if (template) {
		if (CLONEABLES.has(source.type)) {
			template = getTemplate(source)
		}
	} else {
		template = c({ type: "recording" })
	}
	if (target.type === "slot") {
		return {
			result: false,
			operations: [
				c({
					type: "modify",
					id: target.id,
					template,
				}),
			],
		}
	}
	return { ...next, pulse: { ...next.pulse, template } }
}

const CLONEABLES = new Set(["recording", "destruction", "creation"])

/** @type {BehaviourMap} */
export const BEHAVIOURS = {
	raw,
	ping,
	creation,
	destruction: override,
}
