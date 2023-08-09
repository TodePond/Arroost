import {
	getPointer as _getPointer,
	add,
	equals,
	scale,
	subtract,
	use,
} from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Transform } from "../components/transform.js"

export const getPointer = () => {
	const pointer = _getPointer()
	const transform = new Transform.Inverse(shared.scene.transform)

	/** @type {Signal<[number, number]>} */
	const velocity = use([0, 0])

	const HISTORY_LENGTH = 4
	const velocityHistory = []
	let previousPosition = [undefined, undefined]

	// TODO: replace crappy tick function position update with just reimpl of habitat pointer
	// velocity is fine to do here, but we should update the position signal here
	// its always one or two frames behind
	const tick = () => {
		// Do nothing if the pointer hasn't moved yet
		const { position } = pointer
		if (equals(position, [undefined, undefined])) {
			return
		}

		if (equals(previousPosition, [undefined, undefined])) {
			previousPosition = [...position]
		}

		// Update position if it has changed
		const displacement = subtract(position, previousPosition)
		if (!equals(displacement, [0, 0])) {
			transform.position.set(position)
		}

		// Record this in the history
		previousPosition = [...position]
		velocityHistory.push(displacement)
		if (velocityHistory.length > HISTORY_LENGTH) {
			velocityHistory.shift()
		}

		// If there's not enough history, we can't calculate the velocity
		if (velocityHistory.length === 0) {
			velocity.set([0, 0])
			return
		}

		// Otherwise, calculate the velocity
		const sum = velocityHistory.reduce((sum, velocity) => add(sum, velocity), [0, 0])
		const average = scale(sum, 1 / velocityHistory.length)
		if (!equals(average, velocity.get())) {
			velocity.set(average)
		}
	}

	return {
		...pointer,
		tick,
		transform,
		velocity,
	}
}
