import { createPeak, getNod } from "./nogan.js"
import { OPERATION_TYPE, PULSE_TYPE } from "./schema.js"

/** @type {Behave} */
const anyBehave = (parent, { peak, id }) => {
	// Change to creation when coming out of creation nod
	if (peak.template.type === "creation") {
		const transformedPeak = { ...peak, type: PULSE_TYPE.creation }
		return creationBehave(parent, { peak: transformedPeak, id })
	}

	return peak
}

/** @type {Set<NodType>} */
const CLONEABLE = new Set(["recording", "destruction"])

/** @type {Behave} */
const creationBehave = (parent, { peak, id }) => {
	const target = getNod(parent, id)

	if (CLONEABLE.has(target.type)) {
		return { ...peak, data: { type: target.type } }
	}

	if (target.type !== "slot") {
		// If we can't create here, just carry on
		return peak
	}

	// If we can create here, create here!
	const toCreate = peak.data ?? { type: "recording" }
	const operation = {
		type: OPERATION_TYPE.modify,
		data: toCreate,
	}

	return createPeak({
		result: false,
		operations: [operation],
	})
}

export const BEHAVES = {
	any: anyBehave,
	creation: creationBehave,
}
