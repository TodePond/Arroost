import { SILVER } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { createCell } from "../../../nogan/nogan.js"
import { Tunnel } from "../../components/tunnel.js"
import { Dom } from "../../components/dom.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Input } from "../../components/input.js"

export class Dummy extends Entity {
	/**
	 * @param {CellId} id
	 */
	constructor(id = createCell(shared.nogan, { type: "dummy" }).id) {
		super()
		this.input = this.attach(new Input(this))
		this.nog = this.attach(new Tunnel(id))
		this.dom = this.attach(new Dom({ id: "dummy", type: "html", input: this.input }))

		this.back = new Ellipse({ input: this.input })
		this.front = new Ellipse({ input: this.input })

		this.back.dom.transform.scale.set([2 / 3, 2 / 3])

		this.front.dom.transform.scale.set([1 / 3, 1 / 3])
		this.front.dom.style.fill.set(SILVER)
		this.front.dom.style.pointerEvents.set("none")

		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)
	}
}
