import { NoganSchema } from "./schema.js"

const N = NoganSchema

//============//
// Validating //
//============//
export const validate = (nogan, schema = NoganSchema[nogan.schemaName]) => {
	if (window.shared && !window.shared.debug.validate) {
		return
	}
	try {
		schema.validate(nogan)
	} catch (error) {
		console.error(schema.diagnose(nogan))
		throw error
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

	validate(child)
	validate(nogan)
}

export const deleteChild = (nogan, id) => {
	const child = nogan.children[id]
	child.id = null
	nogan.children[id] = null
	freeId(nogan, id)

	validate(nogan)
}

//==========//
// Creating //
//==========//
export const createPhantom = () => {
	const phantom = N.Phantom.make()
	validate(phantom)
	return phantom
}

export const createNod = (parent) => {
	const nod = N.Nod.make()
	addChild(parent, nod)
	return nod
}

export const createWire = (parent, { source, target } = {}) => {
	const wire = N.Wire.make()
	wire.source = source
	wire.target = target
	addChild(parent, wire)

	const sourceNogan = parent.children[source]
	const targetNogan = parent.children[target]
	sourceNogan.outputs.push(wire.id)
	targetNogan.inputs.push(wire.id)

	validate(parent)
	validate(sourceNogan)
	validate(targetNogan)
	validate(wire)

	return wire
}

//===========//
// Destroying //
//===========//
export const destroyWire = (parent, id) => {
	const wire = parent.children[id]
	const sourceNogan = parent.children[wire.source]
	const targetNogan = parent.children[wire.target]

	const sourceIndex = sourceNogan.outputs.indexOf(wire.id)
	const targetIndex = targetNogan.inputs.indexOf(wire.id)

	sourceNogan.outputs.splice(sourceIndex, 1)
	targetNogan.inputs.splice(targetIndex, 1)
	deleteChild(parent, id)

	validate(parent)
	validate(sourceNogan)
	validate(targetNogan)
}

//============//
// Connecting //
//============//
export const replaceNod = (parent, { original, replacement } = {}) => {
	const originalNod = parent.children[original]
	const replacementNod = parent.children[replacement]

	replacementNod.inputs = [...originalNod.inputs]
	replacementNod.outputs = [...originalNod.outputs]
	originalNod.inputs = []
	originalNod.outputs = []

	for (const input of replacementNod.inputs) {
		const wire = parent.children[input]
		wire.target = replacement
	}

	for (const output of replacementNod.outputs) {
		const wire = parent.children[output]
		wire.source = replacement
	}

	validate(parent)
	validate(originalNod)
	validate(replacementNod)
}

export const reconnectWire = (parent, { wire, source, target } = {}) => {
	const wireNogan = parent.children[wire]
	const originalSource = parent.children[wireNogan.source]
	const originalTarget = parent.children[wireNogan.target]
	const replacementSource = parent.children[source] ?? originalSource
	const replacementTarget = parent.children[target] ?? originalTarget

	if (originalSource !== replacementSource) {
		const sourceIndex = originalSource.outputs.indexOf(wire)
		originalSource.outputs.splice(sourceIndex, 1)
		replacementSource.outputs.push(wire)
		wireNogan.source = source
	}

	if (originalTarget !== replacementTarget) {
		const targetIndex = originalTarget.inputs.indexOf(wire)
		originalTarget.inputs.splice(targetIndex, 1)
		replacementTarget.inputs.push(wire)
		wireNogan.target = target
	}

	validate(parent)
	validate(originalSource)
	validate(originalTarget)
	validate(replacementSource)
	validate(replacementTarget)
}
