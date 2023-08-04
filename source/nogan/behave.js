import { c } from "./nogan.js"

/** @type {Behaviour<Pulse>} */
const override = ({ next }) => {
	return next
}

/** @type {Behaviour<PingPulse>} */
const pong = ({ previous, next, target }) => {
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

/** @type {BehaviourMap} */
export const BEHAVIOURS = {
	raw: override,
	creation: override,
	destruction: override,
	ping: pong,
}
