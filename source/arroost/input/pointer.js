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

let done = false

export const getPointer = () => {
	if (done) throw new Error("getPointer called after pointer already initialized")
	done = true

	const transform = new Transform.Inverse(shared.scene?.dom.transform)

	/** @type {Signal<[number, number]>} */
	const velocity = use([0, 0])

	let previousPosition = [undefined, undefined]

	const updatePosition = (position) => {
		// Do nothing if the pointer hasn't moved yet
		if (equals(position, [undefined, undefined])) {
			return
		}

		let firstUpdate = false
		if (equals(previousPosition, [undefined, undefined])) {
			firstUpdate = true
			previousPosition = [...position]
		}

		// Update position if it has changed
		const displacement = subtract(position, previousPosition)
		if (firstUpdate || !equals(displacement, [0, 0])) {
			transform.position.set(position)
		}

		previousPosition = [...position]
	}

	addEventListener("pointermove", (e) => {
		updatePosition([e.clientX, e.clientY])
	})

	addEventListener("pointerup", (e) => {
		updatePosition([e.clientX, e.clientY])
	})

	addEventListener("pointerdown", (e) => {
		updatePosition([e.clientX, e.clientY])
	})

	addEventListener("wheel", (e) => {
		updatePosition([e.clientX, e.clientY])
	})

	const HISTORY_LENGTH = 4
	const velocityHistory = []
	let lastTickPosition = [undefined, undefined]

	const tick = () => {
		// Do nothing if the pointer hasn't moved yet
		if (equals(previousPosition, [undefined, undefined])) {
			return
		}

		// Do nothing if the history stack isn't full yet
		if (velocityHistory.length < HISTORY_LENGTH) {
			const displacement = subtract(previousPosition, lastTickPosition)
			velocityHistory.push(displacement)
			lastTickPosition = [...previousPosition]
			return
		}

		// Update velocity if the pointer has moved enough
		const displacement = subtract(previousPosition, lastTickPosition)
		velocityHistory.push(displacement)
		velocityHistory.shift()
		lastTickPosition = [...previousPosition]

		const sum = velocityHistory.reduce((sum, velocity) => add(sum, velocity), [0, 0])
		const average = scale(sum, 1 / velocityHistory.length)
		if (!equals(average, velocity.get())) {
			velocity.set(average)
		}
	}

	return {
		tick,
		transform,
		velocity,
	}
}
