export const registerPreventDefaults = () => {
	addEventListener("contextmenu", (event) => event.preventDefault(), { passive: false })
	addEventListener("wheel", (e) => e.preventDefault(), { passive: false })
	addEventListener("load", () => (document.body.style["touch-action"] = "none"), { once: true })
}
