import { BLACK, GREY, VOID } from "../libraries/habitat-import.js"
import { Tunnel } from "./arroost/components/tunnel.js"
import { GREY_BLACK, shared } from "./main.js"
import { getAdvanced } from "./nogan/nogan.js"

class Clock {
	bpm = 160

	/** @type {"buildup" | "aftermath"} */
	phase = "buildup"

	/** @type {Function[]} */
	queue = []

	count = 0
	setBpm(bpm) {
		this.bpm = bpm
		Tone.Transport.bpm.value = bpm
	}

	start() {
		const metronome = new Tone.PluckSynth().toDestination()

		Tone.Transport.bpm.value = this.bpm

		let queuedOperations = []
		let queuedUnfiredOperations = []

		Tone.Transport.scheduleRepeat((time) => {
			switch (this.phase) {
				case "buildup": {
					// BEAT!
					this.phase = "aftermath"
					// metronome.triggerAttack("C4", time)

					const active = this.queue
					this.queue = []

					Tone.Draw.schedule(() => {
						// document.body.style["background-color"] = BLACK

						this.count++
						if (this.count > 999) {
							this.count = 0
						}
						Tunnel.applyOperations(queuedUnfiredOperations)
						Tunnel.applyOperations(queuedOperations)

						for (const func of active) {
							func()
						}
					}, time)
					return
				}
				case "aftermath": {
					this.phase = "buildup"

					const { nogan } = shared
					const { advanced, operations, unfiredOperations } = getAdvanced(nogan)
					shared.nogan = advanced
					window.nogan = advanced

					queuedOperations = operations
					queuedUnfiredOperations = unfiredOperations

					// Tone.Draw.schedule(() => {
					// 	document.body.style["background-color"] = GREY_BLACK
					// }, time)
					return
				}
			}
		}, "8n")

		Tone.Transport.start()
	}
}

export const clock = new Clock()

export const beat = () => {
	// const { nogan } = shared
	// const { advanced, operations, unfiredOperations } = getAdvanced(nogan)
	// Tunnel.applyOperations(unfiredOperations)
	// Tunnel.applyOperations(operations)
	// shared.nogan = advanced
	// // @ts-expect-error
	// window.nogan = advanced

	const active = clock.queue
	// nextBeatQueue.current = []
	// for (const func of nextBeatQueue.previous) {
	// 	func()
	// }

	// nextBeatQueue.length = 0
}
