import { WHITE, BLACK, GREY, SILVER } from "../../../../libraries/habitat-import.js"
import { GREY_SILVER } from "../../../main.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { Tunnel } from "../../components/tunnel.js"

/**
 * @param {{
 * 	back: Dom
 * 	front: Dom | null
 * 	input: Input
 * 	tunnel: Tunnel
 * 	frontOverride?: (options: { tunnel: Tunnel, input: Input }) => Colour | undefined | null | false
 * 	backOverride?: (options: { tunnel: Tunnel, input: Input }) => Colour | undefined | null | false
 * }} options
 */
export const setCellStyles = ({ back, front, input, tunnel, frontOverride, backOverride }) => {
	// front.style.pointerEvents.set("none")
	if (front) {
		input.use(() => {
			front.style.fill.set(
				getCellForegroundColour({ tunnel, input, override: frontOverride }).toString(),
			)
		})
	}

	input.use(() => {
		back.style.fill.set(getCellBackgroundColour({ input, tunnel, override: backOverride }))
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

export const getCellForegroundColour = ({ tunnel, input, override }) => {
	const overriden = override?.({ tunnel, input })
	if (overriden) return overriden

	if (tunnel.isFiring.get()) {
		return WHITE
	}
	if (input.is("pulling") || input.is("targeting") || input.targeted.get()) {
		return WHITE
	}
	return BLACK
}

export const getCellBackgroundColour = ({ tunnel, input, override }) => {
	const overriden = override?.({ tunnel, input })
	if (overriden) return overriden

	if (input.is("hovering")) {
		return GREY_SILVER
	}
	if (input.highlighted.get()) {
		return GREY_SILVER
	}
	return GREY
}
