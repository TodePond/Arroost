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

export const destroyNod = (parent, id) => {
	const nod = parent.children[id]
	if (nod.inputs.length > 0 || nod.outputs.length > 0) {
		throw new Error("Cannot destroy nod with wires")
	}

	deleteChild(parent, id)
	validate(parent)
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

export const reconnectWire = (parent, { id, source, target } = {}) => {
	const wireNogan = parent.children[id]
	const originalSource = parent.children[wireNogan.source]
	const originalTarget = parent.children[wireNogan.target]
	const replacementSource = parent.children[source] ?? originalSource
	const replacementTarget = parent.children[target] ?? originalTarget

	if (originalSource !== replacementSource) {
		const sourceIndex = originalSource.outputs.indexOf(id)
		originalSource.outputs.splice(sourceIndex, 1)
		replacementSource.outputs.push(id)
		wireNogan.source = source
	}

	if (originalTarget !== replacementTarget) {
		const targetIndex = originalTarget.inputs.indexOf(id)
		originalTarget.inputs.splice(targetIndex, 1)
		replacementTarget.inputs.push(id)
		wireNogan.target = target
	}

	validate(parent)
	validate(originalSource)
	validate(originalTarget)
	validate(replacementSource)
	validate(replacementTarget)
}

//=========//
// Pulsing //
//=========//
export const addPulse = (parent, { source, target, colour = "blue", type = "any" }) => {
	const nodNod = parent.children[target]
	const { pulse } = nodNod

	// Transform an agnostic pulse into a specific pulse
	const transformedType = type === "any" ? nodNod.type : type

	// Don't do anything if we're already pulsing
	if (pulse[transformedType][colour]) {
		return
	}

	// Update our pulse
	pulse[transformedType][colour] = true

	// TODO: propagate side-effects somehow
	// eg: in current layer
	// eg: in UI

	validate(parent)
	validate(nodNod)
}

//===========//
// Modifying //
//===========//
export const modifyNod = (parent, { id, type, position } = {}) => {
	const nod = parent.children[id]
	nod.type = type ?? nod.type
	nod.position = position ?? nod.position

	validate(parent)
	validate(nod)
}

export const modifyWire = (parent, { id, colour, timing } = {}) => {
	const wire = parent.children[id]
	wire.colour = colour ?? wire.colour
	wire.timing = timing ?? wire.timing

	validate(parent)
	validate(wire)
}
