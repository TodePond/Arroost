import { makeCamera } from "./camera.js"
import { makeGrid } from "./grid.js"

export const makeGlobal = () => {
	const world = makeGrid()
	const camera = makeCamera()
	const global = {world, camera}
	return global
}
