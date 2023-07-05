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
	return {
		...peak,
		result: false,
		operations: [
			{
				type: "replace",
				data: { ...target, type: "recording" },
			},
		],
	}
}

export const NOD_BEHAVES = {
	creation: creationBehave,
}
