import { createPeak } from "./nogan.js"

const creationBehave = (parent, { peak, id }) => {
	const target = parent.children[id]

	// If there's already a command, don't override it
	if (peak.type !== "any" && peak.type !== "creation") {
		return
	}

	// If we can't create here, pass through
	if (target.type !== "slot") {
		return { ...peak, type: "creation" }
	}

	// If we can create here
	// ... create an arrow of recording!
	const operation = {
		type: "replace",
		data: { type: "recording" },
	}

	return createPeak({
		result: false,
		operations: [operation],
	})
}

export const NOD_BEHAVES = {
	creation: creationBehave,
}
