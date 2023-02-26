import { Camera } from "./things/camera.js"
import { World } from "./things/world.js"
import { getPointer } from "./tools/pointer.js"

export const shared = {
	world: new World(),
	camera: new Camera(),
	pointer: getPointer(),
}
