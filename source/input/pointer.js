import {
	getPointer as _getPointer,
	add,
	equals,
	glue,
	scale,
	subtract,
	use,
} from "../../libraries/habitat-import.js"

export const getPointer = (camera) => {
	const pointer = _getPointer()
	pointer.position = use([undefined, undefined])
	pointer.velocity = use([0, 0])
	pointer.absolutePosition = use(() => {
		const [x, y] = pointer.position
		const [sx, sy] = camera.transform.scale

		return [x, y]
	})
	glue(pointer)

	const velocityHistory = []
	const HISTORY_LENGTH = 4

	let previousPosition = [undefined, undefined]

	pointer.tick = () => {
		const { position } = pointer

		if (equals(previousPosition, [undefined, undefined])) {
			previousPosition = [...position]
			return
		}

		const velocity = subtract(position, previousPosition)

		previousPosition = [...position]

		velocityHistory.push(velocity)
		if (velocityHistory.length > HISTORY_LENGTH) {
			velocityHistory.shift()
		}

		if (velocityHistory.length === 0) {
			pointer.velocity = [0, 0]
			return
		}

		const sum = velocityHistory.reduce((sum, velocity) => add(sum, velocity), [0, 0])
		const average = scale(sum, 1 / velocityHistory.length)
		pointer.velocity = average
	}

	return pointer
}
