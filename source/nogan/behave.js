/**
 * @type {Behaviour}
 */
const override = ({ previous, next }) => {
	return next
}

/**
 * @type {Record<PulseType, Behaviour>}
 */
export const BEHAVIOURS = {
	raw: override,
	creation: override,
	destruction: override,
}
