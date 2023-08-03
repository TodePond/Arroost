/**
 * Check if two objects are equal.
 * This is a full, deep comparison.
 * @param {object | undefined} a
 * @param {object | undefined} b
 * @returns {boolean}
 */
export const objectEquals = (a, b) => {
	const aString = JSON.stringify(a)
	const bString = JSON.stringify(b)
	return aString === bString
}
