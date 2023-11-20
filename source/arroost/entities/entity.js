import { snuse, use } from "../../../libraries/habitat-import.js"
import { Component } from "../components/component.js"

export class Entity {
	/** @type {Set<Entity>} */
	components = new Set()

	/** @type {Set<Signal<any>>} */
	signals = new Set()

	/** @type {Set<{ type: string, listener: EventListener }>} */
	listeners = new Set()

	/**
	 * @template {Component} T
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

	/**
	 * @param {string} type
	 * @param {EventListener} listener
	 */
	unlisten(type, listener) {
		removeEventListener(type, listener)
		this.listeners.delete({ type, listener })
	}

	/**
	 * @param {SVGElement | HTMLElement} element
	 * @param {string} attribute
	 * @param {Signal<string | boolean | number | null>} signal
	 * @param {(value: string | boolean | number) => string} transform
	 * @param {Signal<any>[]} dependencies
	 * @returns {Signal<any>}
	 */
	useAttribute(
		element,
		attribute,
		signal,
		transform = (value) => value.toString(),
		dependencies = [signal],
	) {
		return this.use(() => {
			const value = signal.get()
			if (value === null) {
				element.removeAttribute(attribute)
				return
			}

			element.setAttribute(attribute, transform(value))
		}, dependencies)
	}

	/**
	 * @param {HTMLElement | SVGElement} element
	 * @param {string} style
	 * @param {Signal<string | boolean | number | null>} signal
	 * @param {(value: string | boolean | number) => string} transform
	 * @param {Signal<any>[]} dependencies
	 * @returns {Signal<any>}
	 */
	useStyle(
		element,
		style,
		signal,
		transform = (value) => value.toString(),
		dependencies = [signal],
	) {
		return this.use(() => {
			const value = signal.get()
			if (value === null) {
				element.style.removeProperty(style)
				return
			}

			element.style.setProperty(style, transform(value))
		}, dependencies)
	}
}
