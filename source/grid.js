import { makeCell } from "./cell.js"

export const makeGrid = () => {
	const head = makeCell()
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