export const makeCell = (position = [0, 0]) => {	
	const neighbours = [undefined, undefined, undefined, undefined]
	const drawn = true
	const arrows = new Set()
	const doors = [undefined, undefined]
	const cell = {
		position,
		neighbours,
		drawn,
		arrows,
		doors,
	}
	return cell
}