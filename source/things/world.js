import { Thing } from "./thing.js"

export const World = class extends Thing {
	dimensions = use([100, 100])
	things = new Set()
}
