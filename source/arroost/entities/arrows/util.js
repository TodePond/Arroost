import { GREY, WHITE } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { isFiring } from "../../../nogan/nogan.js"

/**
 * @param {CellId} id
 */
export const getCellBackground = (id) => {
	if (isFiring(shared.nogan, { id })) return WHITE
	return GREY
}
