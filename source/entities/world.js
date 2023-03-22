import { Component, Entity } from "../../libraries/habitat-import.js"

export const World = class extends Entity {
	constructor() {
		super([new Component.Transform(), new Component.Stage()])
	}
}
