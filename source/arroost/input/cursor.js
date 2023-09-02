let style = undefined

export const registerCursor = () => {
	addEventListener("load", () => {
		style = document.createElement("style")
		style.innerHTML = CURSOR_STYLE["default"]
		document.head.appendChild(style)
		// document.body.style["cursor"] = "var(--cursor)"
	})
}

const makeCursorStyle = (type) => {
	return `:root {--cursor: ${type}}`
}

const CURSOR_STYLE = {
	none: makeCursorStyle("none"),
	default: makeCursorStyle("default"),
	pointer: makeCursorStyle("pointer"),
	grab: makeCursorStyle("grab"),
	grabbing: makeCursorStyle("grabbing"),
}

export const setCursor = (type) => {
	if (!style) return
	// document.body.style["cursor"] = type
}
