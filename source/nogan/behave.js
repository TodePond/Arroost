import { c } from "./nogan.js"

/** @type {Behaviour<Pulse>} */
const override = ({ previous, next }) => {
	return next
}

/** @type {Behaviour<PingPulse>} */
const pong = ({ previous, next }) => {
	const operation = c({
		type: "pong",
		message: next.pulse.message,
	})
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
