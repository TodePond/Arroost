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

export const nextBeatQueue = {
	/** @type {(Function)[]} */
	current: [],
	/** @type {(Function)[]} */
	previous: [],
}

let ping = true

const beat = () => {
	const { nogan } = shared
	const { advanced, operations, unfiredOperations } = getAdvanced(nogan)
	Tunnel.applyOperations(unfiredOperations)
	Tunnel.applyOperations(operations)
	shared.nogan = advanced
	// @ts-expect-error
	window.nogan = advanced

	// document.body.style["background-color"] = VOID
	// document.body.style["background-color"] = ping ? VOID : BLACK
	ping = !ping

	nextBeatQueue.previous = nextBeatQueue.current
	nextBeatQueue.current = []
	for (const func of nextBeatQueue.previous) {
		func()
	}

	nextBeatQueue.length = 0
}
