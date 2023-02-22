import { add, equals, getPointer as _getPointer, memo, scale, subtract } from "../../libraries/habitat-import.js"

export const getPointer = memo(() => {
	const pointer = _getPointer()
	pointer.velocity = [0, 0]

	const velocityHistory = []
	const HISTORY_LENGTH = 5

	let previousPosition = [undefined, undefined]
	let previousTime = undefined

	pointer.tick = (time) => {
		const { position } = pointer

		if (equals(previousPosition, [undefined, undefined]) || previousTime === undefined) {
			previousTime = time
			previousPosition = [...position]
			return
		}

		const delta = time - previousTime
		const velocity = subtract(position, previousPosition)

		previousTime = time
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
})
