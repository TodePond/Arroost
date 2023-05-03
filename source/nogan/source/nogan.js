import { NoganSchema } from "./schema.js"

//============//
// Validating //
//============//
export const validate = (nogan, schema) => {
	if (!shared.debug.validate) return
	const result = schema.check(nogan)
	if (!result) {
		console.error(nogan)
		throw new Error(`^ Invalid nogan`)
	}
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

export const createChild = (schema, nogan = shared.nogan.current, options = {}) => {
	const child = schema.make()
	Object.assign(child, options)

	addChild(nogan, child)
	validate(child, schema)

	return child
}

//==========//
// Spawning //
//==========//
// Creating a nogan (as above) - and also making a UI element for it

//TODO: create a nod
//TODO: create a wire

//==========//
// Changing //
//==========//
export const setFiring = (nogan, isFiring) => {
	nogan.isFiring = isFiring

	//TODO: update connections (they fire too)
	//TODO: update children (they tick)
}

export const setPosition = (nogan, position) => {
	nogan.position = position

	//TODO: update existing connections (they stay stuck to me)
	//TODO: update any new connections (they might stick to me)
}

//=========//
// Ticking //
//=========//
