import { add, distanceBetween, glue, scale } from "../../../libraries/habitat-import.js"
import { Component } from "./component.js"

export const Movement = class extends Component {
	name = "movement"

	constructor() {
		super()
		glue(this)
	}

	velocity = this.use([0, 0])
	acceleration = this.use([0, 0])
	friction = this.use(0.9)

	rotationalVelocity = this.use(0)
	rotationalAcceleration = this.use(0)

	scaleVelocity = this.use([1, 1])
	scaleAcceleration = this.use([1, 1])

	setAbsoluteVelocity(velocity) {
		const { transform } = this.entity
		if (transform === undefined) {
			this.velocity = velocity
			return
		}
		const parent = this.entity.parent
		if (parent === undefined || parent.transform === undefined) {
			this.velocity = velocity
			return
		}

		this.velocity = [
			velocity.x / transform.absoluteScale.x,
			velocity.y / transform.absoluteScale.y,
		]
	}

	applyFriction(friction = 0.9, minimum = 0.05) {
		const velocity = scale(this.velocity, friction)
		if (distanceBetween(velocity, [0, 0]) < minimum) {
			this.velocity = [0, 0]
			return
		}
		this.velocity = velocity
	}

	update() {
		this.velocity = add(this.velocity, this.acceleration)

		this.rotationalVelocity += this.rotationalAcceleration
		this.scaleVelocity = [
			this.scaleVelocity.x * this.scaleAcceleration.x,
			this.scaleVelocity.y * this.scaleAcceleration.y,
		]

		const { transform } = this.entity
		if (transform === undefined) return
		transform.position = add(transform.position, this.velocity)

		transform.rotation += this.rotationalVelocity
		transform.scale = [
			transform.scale.x * this.scaleVelocity.x,
			transform.scale.y * this.scaleVelocity.y,
		]
	}
}
