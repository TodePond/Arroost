//=====//
// Ids //
//=====//
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

//========//
// Making //
//========//
