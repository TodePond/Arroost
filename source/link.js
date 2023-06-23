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
	// this should be done by something like...
	// travel()
	// which takes a timing parameter, and gets the status of all children (and grandchildren) at that point in time
}
