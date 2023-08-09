import { snuse, use } from "../../../libraries/habitat-import.js"

export const Component = class {
	name = "component"
	signals = new Set()

	/**
	 * @template {any} T
	 * @param {T | (() => T)} template
	 * @param {any?} options
	 * @returns {Signal<T>}
	 */
	use(template, options = {}) {
		const signal = use(template, options)
		this.signals.add(signal)
		return signal
	}

	/**
	 * @template {any} T
	 * @param {T | (() => T)} template
	 * @param {any?} options
	 * @returns {Signal<T>}
	 */
	snuse(template, options) {
		const signal = snuse(template, options)
		this.signals.add(signal)
		return signal
	}

	dispose() {
		for (const signal of this.signals) {
			signal.dispose()
		}
	}
}
