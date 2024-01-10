import { use } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"
import { theme } from "../theme.js"

export function useCursor() {
	use(() => {
		const hero = shared.hero.get()

		switch (hero) {
			case "luke": {
				document.body.style.removeProperty("cursor")
				return
			}

			case "berd": {
				const path =
					theme.get() === "dark"
						? "/assets/berd-cursor.svg"
						: "/assets/berd-cursor-inverse.svg"
				document.body.style.cursor = `url(${path}) 0 20, auto`
				return
			}
		}
	}, [shared.hero])
}
