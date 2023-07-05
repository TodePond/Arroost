const anyBehave = ({ peak, target }) => {
	return peak
}

const destructBehave = ({ peak, target }) => {}

export const NOD_BEHAVES = {
	any: anyBehave,
	destruction: destructBehave,
}
