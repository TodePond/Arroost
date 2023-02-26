import { GREEN, print, registerMethods, Stage } from "../libraries/habitat-import.js"
import { shared } from "./shared.js"
import { Thing } from "./things/thing.js"

registerMethods()
window.print = print

const stage = new Stage({ context: ["2d", "html"] })
stage.start = ([context, html]) => {
	html.style["pointer-events"] = "none"
	shared.camera.registerControls(context.canvas)

	shared.world.things.add(new Thing({ dimensions: [100, 100], colour: GREEN }))
}

stage.tick = (layers, time) => {
	shared.pointer.tick(time)
	shared.camera.tick(layers, time)
	shared.camera.draw(layers, time)
}
