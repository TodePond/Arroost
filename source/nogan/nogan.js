import { Nod } from "./items/nod.js"
import { Wire } from "./items/wire.js"

export const Nogan = class {
	//---------------------------------//
	// STATE to be copied when cloning //
	//---------------------------------//
	items = {}
	nextId = 0
	freeIds = []
	parent = null

	//---------//
	// METHODS //
	//---------//
	static types = {
		nod: Nod,
		wire: Wire,
	}

	createId() {
		if (this.freeIds.length > 0) {
			return this.freeIds.pop()
		}
		const id = this.nextId
		this.nextId++
		return id
	}

	freeId(id) {
		this.freeIds.push(id)
	}

	createItem(type) {
		const Type = Nogan.types[type]
		if (!Type) {
			throw new Error(`Unknown item type: ${type}`)
		}

		const item = new Type()
		item.id = this.createId()
		item.type = type

		this.items[item.id] = item
		return item
	}

	init() {
		this.createItem("layer")
	}
}
