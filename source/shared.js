import { World } from "./things/world.js"
import { Camera } from "./tools/camera.js"
import { getPointer } from "./tools/pointer.js"

export const shared = {
	world: new World(),
	camera: new Camera(),
	pointer: getPointer(),
}
