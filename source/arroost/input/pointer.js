import {
	getPointer as _getPointer,
	add,
	equals,
	scale,
	subtract,
	use,
} from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Movement } from "../components/movement.js"
import { Transform } from "../components/transform.js"

let done = false

export const getPointer = () => {
	if (done) throw new Error("getPointer called after pointer already initialized")
	done = true

	const transform = new Transform.Inverse(shared.scene?.dom.transform)
	const movement = new Movement.Inverse(transform)

	const velocity = movement.velocity

	let previousPosition = [undefined, undefined]

	const updatePosition = (position) => {
		const first = equals(previousPosition, [undefined, undefined])
		if (first) {
			previousPosition = [...position]
		}

		// Update position if it has changed
		const displacement = subtract(position, previousPosition)
		if (first || !equals(displacement, [0, 0])) {
			transform.position.set(position)
		}

		previousPosition = [...position]
	}

	addEventListener("pointermove", (e) => {
		if (e.pointerId < 0) return
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

	addEventListener("touchstart", (e) => {
		velocityHistory.length = 0
	})

	addEventListener("touchend", (e) => {
		velocityHistory.length = 0
		updatePosition([undefined, undefined])
	})

	const HISTORY_LENGTH = 4
	const velocityHistory = []
	let lastTickPosition = [undefined, undefined]

	addEventListener("tick", () => {
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
	})

	return {
		transform,
		movement,
		velocity,
	}
}
