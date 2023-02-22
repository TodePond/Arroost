import { registerMethods, Stage } from "../libraries/habitat-import.js"
import { shared } from "./shared.js"

registerMethods()

const stage = new Stage({ layers: ["2d", "html"] })
stage.start = ([context, html]) => {
	html.style["pointer-events"] = "none"
	shared.camera.registerControls(context.canvas)
}

stage.tick = (layers, delta) => {
	shared.pointer.tick(delta)
	shared.camera.tick(delta)
	shared.camera.draw(layers)
}
