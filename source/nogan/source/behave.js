const anyBehave = ({ peak, target }) => {
	return
}

const CAN_CREATE_AT = new Set(["slot"])
const creationBehave = ({ peak, target }) => {
	if (!CAN_CREATE_AT.has(target)) {
		return {
			peak: { ...peak, type: "creation" },
		}
	}

	const operations = []
}

export const NOD_BEHAVES = {
	any: anyBehave,
	creation: creationBehave,
}
