import { drawCamera, makeCamera } from "./camera.js"
import { updateGrid } from "./grid.js"
import { makeWorld } from "./world.js"

const world = makeWorld()
const camera = makeCamera(world)
const stage = Stage.start()

stage.tick = (context) => {
	updateGrid(world)
	drawCamera(context, camera)
}