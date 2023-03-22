import { registerMethods, Stage } from "../libraries/habitat-import.js"
import { Camera } from "./entities/camera.js"
import { World } from "./entities/world.js"
import { getPointer } from "./input/pointer.js"

registerMethods()

const pointer = getPointer()
const stage = new Stage(["2d", "html", "svg", "2d"])
const camera = new Camera(stage)
const world = new World()

camera.add(world)
