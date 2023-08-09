import { snuse, use } from "../../../libraries/habitat-import.js"

export const Entity = class {
	components = new Set()
	signals = new Set()
	listeners = new Set()

	/**
	 * @template {import("../components/component.js").Component} T
	 * @param {T} component
	 * @returns {T}
	 */
	attach(component) {
		this.components.add(component)
		return component
	}

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

		for (const component of this.components) {
			component.dispose()
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
