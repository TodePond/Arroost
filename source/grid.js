export const makeGrid = () => {
	const cells = new LinkedList()
	const grid = {cells}
	return grid
}

export const updateGrid = (grid) => {
	const buffer = new LinkedList()
	const {cells} = grid
	for (const cell of cells) {
		print(cell)
	}
}

export const drawGrid = (context, grid) => {

}