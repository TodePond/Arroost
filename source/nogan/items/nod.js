export const Nod = class {
	constructor(options) {
		Object.assign(this, {
			parent: null,
			nodTypeName: "default",
			data: {},
			inputs: [],
			outputs: [],
			position: [0, 0],
			isFiring: false,
			...options,
		})
	}
}
