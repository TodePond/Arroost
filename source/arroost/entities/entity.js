import { Entity as _Entity, use } from "../../../libraries/habitat-import.js"

// Extension of Habitat's Entity class.
// We add a signals Set to keep track of all the signals we create.
// The .dispose() method disposes of all the signals.
// We also add a method to dynamically add components to an entity.
export const Entity = class extends _Entity {
	signals = new Set()

	constructor(components = []) {
		super(components)
	}

	use(template, options) {
		const signal = use(template, options)
		this.signals.add(signal)
		return signal
	}

	snuse(template, options) {
		const signal = use(template, { lazy: true, ...options })
		this.signals.add(signal)
		return signal
	}

	// This probably isn't needed!
	// From my tests, chrome doesn't leak memory when we delete an entity.
	// But let's dispose of the signals just in case.
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

	addComponent(component, name = component.name) {
		this.components.push(component)
		this[name] = component
		component.entity = this
	}
}
