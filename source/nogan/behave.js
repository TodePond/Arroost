const creationBehave = ({ peak, target }) => {
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
		data: { ...target, type: "recording" },
	}

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
