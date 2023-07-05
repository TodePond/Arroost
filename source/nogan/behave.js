import { createPeak } from "./nogan.js"

const anyBehave = (parent, { peak, id }) => {
	// Change to creation when coming out of creation nod
	if (peak.template.type === "creation") {
		const transformedPeak = { ...peak, type: "creation" }
		return creationBehave(parent, { peak: transformedPeak, id })
	}

	return peak
}

const creationBehave = (parent, { peak, id }) => {
	const target = parent.children[id]

	// If we can't create here, just carry on
	if (target.type !== "slot") {
		return peak
	}

	// If we can create here
	// ... create an arrow of recording!
	// TODO: Make a different type if there's some data on the pulse
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
	any: anyBehave,
	creation: creationBehave,
}
