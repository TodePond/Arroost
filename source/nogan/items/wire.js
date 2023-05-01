export const Wire = class {
	constructor(options) {
		Object.assign(this, {
			input: null,
			output: null,

			source: [0, 0],
			target: [0, 0],

			time: "same",
			colour: "blue",
			isFiring: false,
			...options,
		})
	}
}
