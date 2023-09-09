import { WHITE, BLACK, GREY, SILVER } from "../../../../libraries/habitat-import.js"
import { GREY_SILVER } from "../../../main.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { Tunnel } from "../../components/tunnel.js"

/**
 * @param {{
 * 	back: Dom
 * 	front: Dom
 * 	input: Input
 * 	tunnel: Tunnel
 * }} options
 */
export const setCellStyles = ({ back, front, input, tunnel }) => {
	// front.style.pointerEvents.set("none")
	input.use(() => {
		front.style.fill.set(getCellForegroundColour({ tunnel, input }).toString())
	})

	input.use(() => {
		back.style.fill.set(getCellBackgroundColour({ input }))
	})

	back.style.shadow.set(true)
	back.style.stroke.set("rgba(0, 0, 0, 0.25)")
	back.style.strokeWidth.set(2)

	back.style.pointerEvents.set("all")

	input.use(() => {
		if (input.state("dragging").active.get()) {
			back.style.cursor.set("grabbing")
		} else {
			back.style.cursor.set("pointer")
		}
	})
}

export const getCellForegroundColour = ({ tunnel, input }) => {
	if (tunnel.isFiring.get()) {
		return WHITE
	}
	if (input.is("pulling") || input.is("targeting") || input.targeted.get()) {
		return WHITE
	}
	return BLACK
}

export const getCellBackgroundColour = ({ input }) => {
	if (input.is("hovering")) {
		return GREY_SILVER
	}
	if (input.highlighted.get()) {
		return GREY_SILVER
	}
	return GREY
}
