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

	createItem(typeName) {
		const Type = Nogan.types[typeName]
		if (!Type) {
			throw new Error(`Unknown item type name: ${typeName}`)
		}

		const item = new Type()
		item.id = this.createId()
		item.typeName = typeName

		this.items[item.id] = item
		return item
	}
}
