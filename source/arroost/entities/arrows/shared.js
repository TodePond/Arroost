import { WHITE, BLACK, GREY, SILVER } from "../../../../libraries/habitat-import.js"
import { GREY_SILVER, theme } from "../../../theme.js"
import { Dom } from "../../components/dom.js"
import { Infinite } from "../../components/infinite.js"
import { Input } from "../../components/input.js"
import { Tunnel } from "../../components/tunnel.js"

/**
 * @param {{
 * 	back: Dom
 * 	front: Dom | null
 * 	input: Input
 * 	tunnel: Tunnel | null
 *  infinite: Infinite | null
 * 	frontOverride?: (options: { tunnel: Tunnel | null, input: Input }) => Colour | undefined | null | false
 * 	backOverride?: (options: { tunnel: Tunnel | null, input: Input }) => Colour | undefined | null | false
 * }} options
 */
export const setCellStyles = ({
	back,
	front,
	input,
	tunnel,
	infinite,
	frontOverride,
	backOverride,
}) => {
	// front.style.pointerEvents.set("none")
	if (front) {
		input.use(() => {
			front.style.fill.set(
				getCellForegroundColour({ tunnel, input, override: frontOverride }).toString(),
			)
		})
	}

	input.use(() => {
		back.style.fill.set(
			getCellBackgroundColour({ input, tunnel, override: backOverride, infinite }),
		)
	})

	back.style.shadow.set(true)
	back.style.stroke.set(theme.get() === "dark" ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 20, 0.02)")
	back.style.strokeWidth.set(2)

	// back.style.pointerEvents.set(infinite?.isPreview ? "none" : "all")
	back.style.pointerEvents.set("all")

	input.use(() => {
		if (input.state("dragging").active.get()) {
			back.style.cursor.set("grabbing")
		} else {
			back.style.cursor.set("pointer")
		}
	}, [input.state("dragging").active])
}

/**
 * @param {{
 * 	tunnel: Tunnel | null
 * 	input: Input
 * 	override?: (options: { tunnel: Tunnel | null, input: Input }) => Colour | undefined | null | false
 * }} options
 * @returns
 */
export const getCellForegroundColour = ({ tunnel, input, override }) => {
	const overriden = override?.({ tunnel, input })
	if (overriden) return overriden

	if (tunnel?.isFiring.get()) {
		return tunnel.firingColour.get() ?? BLACK
	}
	if (input.is("pulling") || input.is("targeting") || input.targeted.get()) {
		return WHITE
	}
	return BLACK
}

/**
 * @param {{
 * 	tunnel: Tunnel | null
 * 	input: Input
 * 	infinite: Infinite | null
 * 	override?: (options: { tunnel: Tunnel | null, input: Input }) => Colour | undefined | null | false
 * }} options
 * @returns
 */
export const getCellBackgroundColour = ({ tunnel, input, override, infinite }) => {
	const overriden = override?.({ tunnel, input })
	if (overriden) return overriden

	if (input.is("hovering")) {
		return GREY_SILVER
	}
	if (input.highlighted.get()) {
		return GREY_SILVER
	}

	if (infinite?.state.get() === "zooming-in") {
		return GREY_SILVER
	}

	return GREY
}
