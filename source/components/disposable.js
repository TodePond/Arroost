import { Component, use } from "../../libraries/habitat-import.js"

export const DisposableComponent = class extends Component {
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
	}
}
