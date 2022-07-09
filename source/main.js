import { makeGlobal } from "./global.js"
import { updateGrid, drawGrid } from "./grid.js"

const global = makeGlobal()
const stage = Stage.start()
stage.tick = (context) => {
	const {world, currentGrid} = global
	updateGrid(world)
	drawGrid(context, currentGrid)
}