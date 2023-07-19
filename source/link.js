import { shared } from "./main.js"
import { deepAdvance } from "./nogan/nogan.js"

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
	const { root } = shared.nogan
	for (const id in root.children) {
		const child = root.children[id]
		if (!child.isNod) continue
	}
	const { parent: advanced, operations } = deepAdvance(root)
	const child = root.children[1]
	const after = advanced.children[1]
	print(child?.pulses.blue)
	print(after?.pulses.blue) //this is getting unfired correctly!
	// only problem is... it's not triggering an operation.
	// I think I need to manually jam one in for fire-ends due to advancing.
	// should be ok!
}
