export const Nod = class {
	constructor(options) {
		Object.assign(this, {
			layer: null, //TODO: default to camera's current layer
			nodType: "default",
			data: {},
			inputs: [],
			outputs: [],
			position: [0, 0],
			isFiring: false,
			...options,
		})
	}
}
