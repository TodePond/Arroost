import { shared } from "./main.js"
import { addPulse, getPeak } from "./nogan/source/nogan.js"
import { NoganSchema as N, PULSE_COLOURS } from "./nogan/source/schema.js"

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
	const now = shared.nogan.root

	// for (const id in now.children) {
	// 	const peak = getFullPeak(now, {
	// 		id,
	// 		timing: 1,
	// 		history: [now],
	// 	})
	// }
}

//=============//
// Nogan Sugar //
//=============//

export const getFullPeak = (parent, { id, timing = 0, history = [] } = {}) => {
	const fullPeak = N.Peak.make()
	for (const colour of PULSE_COLOURS) {
		const peak = getPeak(parent, { id, colour, timing, history })
		fullPeak[colour] = peak
	}
	return fullPeak
}

export const addFullPulse = (parent, { source, target } = {}) => {
	for (const colour of PULSE_COLOURS) {
		addPulse(parent, { source, target, colour })
	}
}
