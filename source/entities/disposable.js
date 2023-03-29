import { Entity, use } from "../../libraries/habitat-import.js"

export const DisposableEntity = class extends Entity {
	signals = new Set()

	use(template, options) {
		const signal = use(template, options)
		this.signals.add(signal)
		return signal
	}

	dispose() {
		for (const signal of this.signals) {
			signal.dispose()
		}
		for (const component of this.components) {
			component.dispose?.()
		}
		if (this.parent) {
			this.parent.delete(this)
		}
	}
}
