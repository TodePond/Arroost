// =====
// This comment is not related to the code below
// It is for the unique id rewrite, currently underway
// =====
// A behaviour happens when a pulse moves from one cell to another
// The peak is a peak of the pulse at the source cell
// The target is the id of the target cell
// =====

/**
 * @type {Behaviour}
 */
const override = ({ previous, next }) => {
	return next
}

/**
 * @type {Record<PulseType, Behaviour>}
 */
export const BEHAVIOURS = {
	raw: override,
	creation: override,
	destruction: override,
}

// /** @type {Behave} */
// const anyBehave = (parent, { peak, id }) => {
// 	// Change to creation when coming out of creation nod
// 	if (peak.template.type === "creation") {
// 		const transformedPeak = { ...peak, type: PULSE_TYPE.creation }
// 		return creationBehave(parent, { peak: transformedPeak, id })
// 	}

// 	return peak
// }

// /** @type {Set<NodType>} */
// const CLONEABLE = new Set(["recording", "destruction"])

// /** @type {Behave} */
// const creationBehave = (parent, { peak, id }) => {
// 	const target = getNod(parent, id)

// 	if (CLONEABLE.has(target.type)) {
// 		return { ...peak, data: { type: target.type } }
// 	}

// 	if (target.type !== "slot") {
// 		// If we can't create here, just carry on
// 		return peak
// 	}

// 	// If we can create here, create here!
// 	const toCreate = peak.data ?? { type: "recording" }
// 	const operation = {
// 		type: OPERATION_TYPE.modify,
// 		data: toCreate,
// 	}

// 	return createPeak({
// 		result: false,
// 		operations: [operation],
// 	})
// }

// export const BEHAVES = {
// 	any: anyBehave,
// 	creation: creationBehave,
// }
