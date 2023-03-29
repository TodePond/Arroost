import { add, glue, use } from "../../libraries/habitat-import.js"
import { DisposableComponent } from "./disposable.js"

export const Movement = class extends DisposableComponent {
	name = "movement"

	constructor() {
		super()
		glue(this)
	}

	velocity = use([0, 0])
	acceleration = use([0, 0])

	rotationalVelocity = use(0)
	rotationalAcceleration = use(0)

	scaleVelocity = use([1, 1])
	scaleAcceleration = use([1, 1])

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
