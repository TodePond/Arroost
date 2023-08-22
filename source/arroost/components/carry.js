import { Component } from "./component.js"

export class Carry extends Component {
	constructor({ movement, input, transform }) {
		super()
		this.movement = movement
		this.input = input
		this.transform = transform
	}
}
