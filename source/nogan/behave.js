import { c } from "./nogan.js"

/** @type {Behaviour} */
const override = ({ previous, next }) => {
	return next
}

/** @type {Behaviour} */
const ping = ({ previous, next }) => {
	const operation = {
		type: c("ping"),
		message: c("pong"),
	}
	return {
		...next,
		operations: [operation],
	}
}

/** @type {Record<PulseType, Behaviour>} */
export const BEHAVIOURS = {
	raw: override,
	creation: override,
	destruction: override,
	ping: ping,
}
