import { shared } from "./main.js"
import { getPeak } from "./nogan/source/nogan.js"

const BPM = 122

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

	for (const [id] of now.children) {
		const afterChild = getPeak(now, {
			id,
			// ??? Todo: Figure out. getPeak requires very specific arguments. I guess I just do all of them? Or can I group stuff together? Maybe just do indivudally first!
		})
	}
}
