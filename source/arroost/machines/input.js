import { State } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Input } from "../components/input.js"
import { ArrowOfRecording } from "../entities/arrows/recording.js"
import { fireTool, selectTool } from "../entities/tool.js"
import { triggerRightClickPity } from "../input/wheel.js"
import { InputState } from "./input-state.js"
// import { replenishUnlocks } from "../entities/unlock.js"

let createdArrowOfRecording = null

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

	keydown({ ctrlKey, metaKey, key }) {
		switch (key.toLowerCase()) {
			case " ": {
				return new Handing()
			}
			case "r": {
				if (ctrlKey || metaKey) return

				if (
					createdArrowOfRecording &&
					createdArrowOfRecording.recordingState.get() === "recording"
				) {
					createdArrowOfRecording.onFire()
					return
				}

				const arrowOfRecording = new ArrowOfRecording()
				shared.scene.layer.cell.append(arrowOfRecording.dom)
				arrowOfRecording.dom.transform.setAbsolutePosition(
					shared.pointer.transform.absolutePosition.get(),
				)
				createdArrowOfRecording = arrowOfRecording
				arrowOfRecording.onFire()
				return
			}
			case "d": {
				return selectTool("destruction")
			}
			case "c": {
				return selectTool("connection")
			}
			case "s": {
				return selectTool("creation")
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
