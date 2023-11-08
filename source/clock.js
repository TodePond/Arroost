import { BLACK, GREY, VOID } from "../libraries/habitat-import.js"
import { Tunnel } from "./arroost/components/tunnel.js"
import { GREY_BLACK, shared } from "./main.js"
import { getAdvanced } from "./nogan/nogan.js"

class Clock {
	bpm = 120

	/** @type {"buildup" | "aftermath"} */
	phase = "buildup"

	/** @type {Function[]} */
	queue = []

	start() {
		Tone.Transport.bpm.value = this.bpm

		Tone.Transport.scheduleRepeat((time) => {
			switch (this.phase) {
				case "buildup":
					// BEAT!
					this.phase = "aftermath"

					const { nogan } = shared
					const { advanced, operations, unfiredOperations } = getAdvanced(nogan)

					Tone.Draw.schedule(() => {
						Tunnel.applyOperations(unfiredOperations)
						Tunnel.applyOperations(operations)
						shared.nogan = advanced
						window.nogan = advanced

						const active = this.queue
						this.queue = []
						for (const func of active) {
							func()
						}
					}, time)
					break
				case "aftermath":
					this.phase = "buildup"
					break
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
