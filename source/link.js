import { shared } from "./main.js"
import { getAdvanced } from "./nogan/nogan.js"

const BPM = 120 //240

let lastBeats = 0

export const frame = (time = 0) => {
	const seconds = time / 1000
	const minutes = seconds / 60
	const beats = Math.floor(minutes * BPM)
	if (beats > lastBeats) {
		lastBeats = beats
		beat()
	}
	requestAnimationFrame(frame)
}

const beat = () => {
	const { nogan } = shared
	const { advanced, operations } = getAdvanced(nogan)
	print(operations)
}
