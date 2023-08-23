import { WHITE, BLACK, GREY, SILVER } from "../../../../libraries/habitat-import.js"
import { GREY_SILVER } from "../../../main.js"

export const getCellForegroundColour = ({ tunnel }) => {
	if (tunnel.isFiring.get()) {
		return WHITE
	}
	return BLACK
}

export const getCellBackgroundColour = ({ input }) => {
	if (input.is("hovering")) {
		return GREY_SILVER
	}
	return GREY
}

export const setCellColours = ({ back, front, input, tunnel }) => {
	input.use(() => {
		front.dom.style.fill.set(getCellForegroundColour({ tunnel }))
	})

	input.use(() => {
		back.dom.style.fill.set(getCellBackgroundColour({ input }))
	})
}
