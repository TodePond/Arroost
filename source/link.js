import { BLACK, VOID } from "../libraries/habitat-import.js"
import { Tunnel } from "./arroost/components/tunnel.js"
import { shared } from "./main.js"
import { getAdvanced } from "./nogan/nogan.js"

export const msPerBeat = () => {
	const { clock } = shared
	const secondsPerBeat = 60 / clock.bpm
	const msPerBeat = secondsPerBeat * 1000
	return msPerBeat
}

export const frame = (time = 0) => {
	const { clock } = shared
	clock.time = time
	const seconds = time / 1000
	const minutes = seconds / 60
	const beatCount = Math.floor(minutes * clock.bpm)
	if (beatCount > clock.beatCount) {
		clock.beatCount = beatCount
		clock.lastBeatTime = time
		beat()
	}
	requestAnimationFrame(frame)
}

export const nextBeatQueue = []

let ping = true

const beat = () => {
	const { nogan } = shared
	const { advanced, operations, unfiredOperations } = getAdvanced(nogan)
	Tunnel.applyOperations(unfiredOperations)
	Tunnel.applyOperations(operations)
	shared.nogan = advanced

	// document.body.style["background-color"] = VOID
	// document.body.style["background-color"] = ping ? VOID : BLACK
	ping = !ping

	for (const func of nextBeatQueue) {
		func()
	}
	nextBeatQueue.length = 0
}
