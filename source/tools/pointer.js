import { getPointer as _getPointer, memo } from "../../libraries/habitat-import.js"

export const getPointer = memo(() => {
	const pointer = _getPointer()
	pointer.velocity = [0, 0]

	const positionHistory = []
	const HISTORY_LENGTH = 5

	pointer.tick = (delta) => {}

	return pointer
})
