import { State } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { fireCell, fullFireCell } from "../../nogan/nogan.js"
import { Input } from "../components/input.js"
import { Tunnel } from "../components/tunnel.js"
import { ArrowOfRecording } from "../entities/arrows/recording.js"
import { fireTool, selectTool } from "../entities/tool.js"
import { unlockEverything } from "../entities/unlock.js"
import { triggerRightClickPity } from "../input/wheel.js"
import { InputState } from "./input-state.js"
// import { replenishUnlocks } from "../entities/unlock.js"

export class Hovering extends InputState {
	name = "hovering"

	enter() {
		super.enter()
	}

	pointerover() {
		if (this.input === shared.hovering.input.get()) return
		return new Hovering()
	}

	pointerdown() {
		return new Pointing(this.input)
	}

	keydown(event) {
		const { ctrlKey, metaKey, key, altKey } = event
		switch (key.toLowerCase()) {
			case "q": {
				unlockEverything()
				return
			}

			case " ": {
				return new Handing()
			}
			case "r": {
				if (ctrlKey || metaKey) return

				if (ArrowOfRecording.recordingArrows.size > 0) {
					const arrows = [...ArrowOfRecording.recordingArrows]
					for (const arrow of arrows) {
						arrow.fromClick = true
						arrow.recordingBusy.set(true)
						Tunnel.schedule(() => {
							arrow.recordingBusy.set(false)
							return fullFireCell(shared.nogan, { id: arrow.tunnel.id })
						})
					}
					return
				}

				const arrowOfRecording = new ArrowOfRecording()
				shared.scene.layer.cell.append(arrowOfRecording.dom)
				arrowOfRecording.dom.transform.setAbsolutePosition(
					shared.pointer.transform.absolutePosition.get(),
				)
				arrowOfRecording.recordingBusy.set(true)
				Tunnel.schedule(() => {
					arrowOfRecording.recordingBusy.set(false)
					return fullFireCell(shared.nogan, { id: arrowOfRecording.tunnel.id })
				})
				return
			}
			case "f": {
				shared.scene.focusMode.set(!shared.scene.focusMode.get())
				return
			}
			case "d": {
				return selectTool("destruction")
			}
			case "c": {
				return selectTool("connection")
			}
			case "a": {
				return selectTool("connection")
			}
			case "s": {
				return selectTool("creation")
			}
			case "t": {
				return selectTool("definition")
			}
			case "tab": {
				if (ctrlKey || metaKey || altKey) return
				const hero = shared.hero.get()
				const newHero = hero === "luke" ? "berd" : "luke"
				shared.hero.set(newHero)
				return event.preventDefault()
			}
		}
	}
}

export class Handing extends InputState {
	name = "handing"

	pointerdown() {
		return new Dragging(shared.scene.input)
	}

	keyup({ key }) {
		if (key.toLowerCase() === " ") {
			return new Hovering()
		}
	}
}

export class Pointing extends InputState {
	name = "pointing"
	cursor = "pointer"

	pointerup() {
		return new Hovering()
	}

	pointerdown(e) {
		this.button = e.button
	}

	pointermove() {
		return new Dragging()
	}
}

export class Dragging extends InputState {
	name = "dragging"
	cursor = "grabbing"

	pointerup(e) {
		if (e.button === 2) {
			triggerRightClickPity()
		}
		if (shared.keyboard[" "]) {
			return new Handing()
		}
		return new Hovering()
	}
}

export const InputMachine = Hovering
