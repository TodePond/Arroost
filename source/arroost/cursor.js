import { use } from "../../libraries/habitat-import.js"
import { shared } from "../main.js"

export function useCursor() {
	use(() => {
		const hero = shared.hero.get()

		switch (hero) {
			case "luke": {
				document.body.style.removeProperty("cursor")
				return
			}

			case "berd": {
				const path = "/assets/berd-cursor.svg"
				document.body.style.cursor = `url(${path}) 0 20, auto`
				return
			}
		}
	}, [shared.hero])
}
