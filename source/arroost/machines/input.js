import { State } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { Input } from "../components/input.js"
import { fireTool, selectTool } from "../entities/tool.js"
import { triggerRightClickPity } from "../input/wheel.js"
import { InputState } from "./input-state.js"
// import { replenishUnlocks } from "../entities/unlock.js"

export class Hovering extends InputState {
	name = "hovering"

	enter() {
		console.log("s")
		super.enter()
	}

	pointerover() {
		if (this.input === shared.hovering.input.get()) return
		return new Hovering()
	}

	pointerdown() {
		return new Pointing(this.input)
	}

	keydown({ key }) {
		switch (key.toLowerCase()) {
			// case "d": {
			// 	// return new Debugging()
			// }
			case " ": {
				return new Handing()
			}
		}
	}

	keyup({ key }) {
		switch (key.toLowerCase()) {
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

// export class Debugging extends InputState {
// 	name = "debugging"
// 	cursor = "help"

// 	keyup({ key }) {
// 		if (key.toLowerCase() === "d") {
// 			return new Hovering()
// 		}
// 	}

// 	pointerdown(e) {
// 		if (e.ctrlKey || e.metaKey) {
// 			print(shared.hovering.input.get())
// 		} else {
// 			print(shared.hovering.input.get().entity)
// 		}
// 	}
// }

export const InputMachine = Hovering
