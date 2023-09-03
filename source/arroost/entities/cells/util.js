import { WHITE, BLACK, GREY, SILVER } from "../../../../libraries/habitat-import.js"
import { GREY_SILVER } from "../../../main.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { Tunnel } from "../../components/tunnel.js"
import { Entity } from "../entity.js"

// This is a joint effort from many different entities/components
// So I didn't know where to put it
// So it has ended up here
/**
 * @param {{
 * 	back: Dom
 * 	front: Dom
 * 	input: Input
 * 	tunnel: Tunnel
 * }} options
 */
export const setCellStyles = ({ back, front, input, tunnel }) => {
	front.style.pointerEvents.set("none")
	input.use(() => {
		front.style.fill.set(getCellForegroundColour({ tunnel }).toString())
	})

	input.use(() => {
		back.style.fill.set(getCellBackgroundColour({ input }))
	})

	back.style.pointerEvents.set("all")

	input.use(() => {
		if (input.state("dragging").active.get()) {
			back.style.cursor.set("grabbing")
		} else {
			back.style.cursor.set("pointer")
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
