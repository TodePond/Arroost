import { subtract, scale, add } from "./habitat-import.js"

export const lerp = ([a, b], distance, easeFunction = (x) => x) => {
	const range = subtract(b, a)
	const displacement = scale(range, distance)
	return add(a, displacement)
}

export const EASE = {
	linear: (x) => x,
	easeIn: (x) => x * x,
	easeOut: (x) => 1 - (1 - x) * (1 - x),
	easeInOut: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),

	easeInQuad: (x) => x * x,
	easeOutQuad: (x) => 1 - (1 - x) * (1 - x),
	easeInOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
	easeInCubic: (x) => x * x * x,
	easeOutCubic: (x) => 1 - Math.pow(1 - x, 3),
	easeInOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
	easeInQuart: (x) => x * x * x * x,
	easeOutQuart: (x) => 1 - Math.pow(1 - x, 4),
	easeInOutQuart: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
	easeInQuint: (x) => x * x * x * x * x,
	easeOutQuint: (x) => 1 - Math.pow(1 - x, 5),
	easeInOutQuint: (x) => (x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2),

	easeInSine: (x) => 1 - Math.cos((x * Math.PI) / 2),
	easeOutSine: (x) => Math.sin((x * Math.PI) / 2),
	easeInOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
	easeInExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
	easeOutExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
	easeInOutExpo: (x) =>
		x === 0
			? 0
			: x === 1
			? 1
			: x < 0.5
			? Math.pow(2, 20 * x - 10) / 2
			: (2 - Math.pow(2, -20 * x + 10)) / 2,
	easeInCirc: (x) => 1 - Math.sqrt(1 - Math.pow(x, 2)),
	easeOutCirc: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
	easeInOutCirc: (x) =>
		x < 0.5
			? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
			: (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2,
}
