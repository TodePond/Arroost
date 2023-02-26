import { registerMethods, Stage } from "../libraries/habitat-import.js"
import { shared } from "./shared.js"

registerMethods()

const stage = new Stage({ context: ["2d", "html"] })
stage.start = ([context, html]) => {
	html.style["pointer-events"] = "none"
	shared.camera.registerControls(context.canvas)
}

stage.tick = (layers, time) => {
	shared.pointer.tick(time)
	shared.camera.tick(time)
	shared.camera.draw(layers)
}
