import { Component, Entity } from "../../libraries/habitat-import.js"
import { Movement } from "../components/movement.js"

export const Camera = class extends Entity {
	constructor(stage) {
		super([new Component.Transform(), new Component.Stage(stage), new Movement()])
	}
}
