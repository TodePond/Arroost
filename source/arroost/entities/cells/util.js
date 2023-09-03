import { WHITE, BLACK, GREY, SILVER } from "../../../../libraries/habitat-import.js"
import { GREY_SILVER } from "../../../main.js"

// This is a joint effort from many different entities/components
// So I didn't know where to put it
// So it has ended up here
export const setCellStyles = ({ back, front, input, tunnel }) => {
	input.use(() => {
		front.dom.style.fill.set(getCellForegroundColour({ tunnel }))
	})

	input.use(() => {
		back.dom.style.fill.set(getCellBackgroundColour({ input }))
	})

	front.dom.style.pointerEvents.set("none")
	input.use(() => {
		if (input.state("dragging").active.get()) {
			back.dom.style.cursor.set("grabbing")
		} else {
			back.dom.style.cursor.set("pointer")
		}
	})
}

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
