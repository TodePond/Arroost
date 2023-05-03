import { NoganSchema } from "./schema.js"

export const NoganBoss = class {
	static makePhantom() {
		return NoganSchema.Phantom.make()
	}

	static createId(nogan) {
		if (nogan.freeIds.length > 0) {
			return nogan.freeIds.pop()
		}
		const id = nogan.nextId
		nogan.nextId++
		return id
	}

	static freeId(nogan, id) {
		nogan.freeIds.push(id)
	}
}
