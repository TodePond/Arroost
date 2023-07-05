import { modifyNod } from "./nogan.js"

const modify = (parent, { id, data }) => {
	modifyNod(parent, { id, ...data })
}

export const OPERATES = {
	modify,
}
