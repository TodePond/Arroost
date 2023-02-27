import { Signal, useSignal } from "../../libraries/habitat-import.js"

export const set = (object, properties) => {
	for (const key in properties) {
		const newValue = properties[key]
		const oldValue = object[key]
		if (oldValue instanceof Signal) {
			oldValue.set(newValue)
		} else {
			object[key] = newValue
		}
	}
	return object
}

export const use = useSignal
