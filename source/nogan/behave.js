import { c } from "./nogan.js"

/** @type {Behaviour<Pulse>} */
const override = ({ next }) => {
	return next
}

/** @type {Behaviour<PingPulse>} */
const pong = ({ next }) => {
	const operation = c({
		type: "pong",
		message: next.pulse.message,
	})
	return {
		...next,
		operations: [operation],
	}
}

/** @type {Behaviour<RawPingPulse>} */
const rawPing = ({ target, next }) => {
	if (target.type === "pinger") {
		const pulse = c({
			...next.pulse,
			type: "ping",
			message: "yo",
		})
		return {
			...next,
			pulse,
		}
	}
	return next
}

/** @type {BehaviourMap} */
export const BEHAVIOURS = {
	raw: override,
	creation: override,
	destruction: override,
	ping: pong,
	rawPing: rawPing,
}
