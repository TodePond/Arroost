import { Component as _Component, use } from "../../../libraries/habitat-import.js"

// This probably isn't needed!
// From my tests, chrome doesn't leak memory when we delete an entity.
// But let's dispose of the signals just in case.
export const Component = class extends _Component {
	constructor(name) {
		super(name)
	}

	signals = new Set()

	/**
	 * @template {Value} T
	 * @param {T | (() => T)} template
	 * @param {any?} options
	 * @returns {Signal<T>}
	 */
	use(template, options = {}) {
		const signal = use(template, options)
		this.signals.add(signal)
		return signal
	}

	dispose() {
		for (const signal of this.signals) {
			signal.dispose()
		}
	}
}
