/**
 * Check if two objects are equal.
 * This is a full, deep comparison.
 * But slow as fuck.
 * @param {object | null | undefined} a
 * @param {object | null | undefined} b
 * @returns {boolean}
 */
export const objectEquals = (a, b) => {
	const aString = JSON.stringify(a)
	const bString = JSON.stringify(b)
	return aString === bString
}
