import { getPointer } from "./input/pointer.js"
import { Camera } from "./things/camera.js"
import { World } from "./things/world.js"

export const shared = {
	world: new World(),
	camera: new Camera(),
	pointer: getPointer(),
}
