import { add, Component, use } from "../../libraries/habitat-import.js"

export const Movement = class extends Component {
	name = "movement"
	velocity = use([0, 0])
	acceleration = use([0, 0])

	rotationalVelocity = use(0)
	rotationalAcceleration = use(0)

	scaleVelocity = use(0)
	scaleAcceleration = use(0)

	update() {
		this.velocity = add(this.velocity, this.acceleration)

		this.rotationalVelocity += this.rotationalAcceleration
		this.scaleVelocity += this.scaleAcceleration

		const { transform } = this
		if (!transform) return
		transform.position = add(transform.position, this.velocity)

		transform.rotation += this.rotationalVelocity
		transform.scale += this.scaleVelocity
	}
}
