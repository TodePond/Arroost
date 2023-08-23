export const getZoomer = () => {
	const zoomer = {
		speed: 0.0,
		desiredSpeed: 0.0,
		smoothMode: false,
		tick() {
			if (!this.smoothMode) {
				this.speed = this.desiredSpeed
			} else {
				const missingSpeed = this.desiredSpeed - this.speed
				this.speed += Math.sign(missingSpeed) * 0.00005
			}

			if (Math.abs(this.speed) < 0.00001) {
				this.speed = 0.0
				return
			}

			if (!this.smoothMode) {
				this.desiredSpeed *= 0.8
				if (Math.abs(this.desiredSpeed) < 0.001) {
					this.desiredSpeed = 0.0
				}
			}
		},
	}
	return zoomer
}
