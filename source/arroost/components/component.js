import { snuse, use } from "../../../libraries/habitat-import.js"

export const Component = class {
	name = "component"
	signals = new Set()
	listeners = new Set()

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
	snuse(template, options = {}) {
		const signal = snuse(template, options)
		this.signals.add(signal)
		return signal
	}

	dispose() {
		for (const signal of this.signals) {
			signal.dispose()
		}

		for (const { type, listener } of this.listeners) {
			removeEventListener(type, listener)
		}
	}

	/**
	 * @param {string} type
	 * @param {EventListener} listener
	 * @param {AddEventListenerOptions} options
	 */
	listen(type, listener, options = {}) {
		addEventListener(type, listener, options)
		this.listeners.add({ type, listener })
		return listener
	}
}
