import { NoganSchema } from "./schema.js"

export const validate = (nogan, schema) => {
	if (window.shared && !window.shared.debug.validate) {
		return
	}
	schema.validate(nogan)
}

//========//
// Family //
//========//
export const createId = (nogan) => {
	if (nogan.freeIds.length > 0) {
		return nogan.freeIds.pop()
	}
	const id = nogan.nextId
	nogan.nextId++
	return id
}

export const freeId = (nogan, id) => {
	nogan.freeIds.push(id)
}

export const addChild = (nogan, child) => {
	const id = createId(nogan)
	child.id = id
	nogan.children[id] = child

	//TODO: update connections (they might stick to the new child)
}

//==========//
// Creating //
//==========//
// Just creating a nogan within a nogan
export const createPhantom = () => {
	return NoganSchema.Phantom.make()
}

export const createChild = (schema, parent = shared.nogan.current, options = {}) => {
	const child = schema.make()
	Object.assign(child, options)

	addChild(parent, child)
	validate(child, schema)
	validate(parent, NoganSchema.Parent) //todo: this shouldn't match parent

	return child
}

//=========//
// Ticking //
//=========//
export const getTicked = (nogan) => {
	const ticked = JSON.parse(JSON.stringify(nogan))
	if (nogan.isParent) {
		if (!nogan.isPhantom) {
			ticked.pulse = getTickedPulse(ticked.pulse)
		}

		for (const id in ticked.children) {
			ticked.children[id] = getTicked(ticked.children[id])
		}
	}
	validate(ticked, NoganSchema.Parent)
	return ticked
}

export const getTickedPulse = (pulse) => {
	const ticked = JSON.parse(JSON.stringify(pulse))
	for (const type in pulse) {
		for (const colour in pulse[type]) {
			ticked[type][colour] = false
		}
	}
	return ticked
}
