import {
	add,
	BLACK,
	Colour,
	COLOURS,
	GREY,
	SILVER,
	use,
	WHITE,
} from "../libraries/habitat-import.js"

export const GREY_SILVER = new Colour(83, 101, 147)
export const GREY_BLACK = new Colour(31, 39, 54)

/** @type {Signal<"light" | "dark">} */
export const theme = use("light")

const BASE = {
	WHITE,
	BLACK,
	GREY,
	GREY_SILVER,
	GREY_BLACK,
	SILVER,
}

window["BASE"] = BASE

const DARK = {
	WHITE: [...WHITE],
	BLACK: [...BLACK],
	GREY: [...GREY],
	GREY_SILVER: [...GREY_SILVER],
	GREY_BLACK: [...GREY_BLACK],
}

const LIGHT = {
	WHITE: [...BLACK],
	BLACK: [...new Colour(255, 255, 255)],
	GREY: [...SILVER],
	GREY_SILVER: [...SILVER],
	GREY_BLACK: [...SILVER],
}

export function useTheme() {
	addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			theme.set(theme.get() === "light" ? "dark" : "light")
		}
	})

	use(() => {
		switch (theme.get()) {
			case "light": {
				for (const key in LIGHT) {
					BASE[key][0] = LIGHT[key][0]
					BASE[key][1] = LIGHT[key][1]
					BASE[key][2] = LIGHT[key][2]
				}
				break
			}
			case "dark": {
				for (const key in DARK) {
					BASE[key][0] = DARK[key][0]
					BASE[key][1] = DARK[key][1]
					BASE[key][2] = DARK[key][2]
				}
				break
			}
		}
	}, [theme])
}
