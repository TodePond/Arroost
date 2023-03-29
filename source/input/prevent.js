export const preventDefaults = () => {
	addEventListener("contextmenu", (event) => event.preventDefault(), { passive: false })
	addEventListener(
		"load",
		(event) => {
			document.body.style["touch-action"] = "none"
		},
		{ passive: false, once: true },
	)
}
