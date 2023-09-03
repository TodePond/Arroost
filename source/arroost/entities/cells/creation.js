import { shared } from "../../../main.js"
import { createCell, t } from "../../../nogan/nogan.js"
import { Carry } from "../../components/carry.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { Tunnel } from "../../components/tunnel.js"
import { HALF } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"
import { setCellStyles } from "./util.js"

export class Creation extends Entity {
	constructor({ id = createCell(shared.nogan, { type: "creation" }).id, position = t([0, 0]) }) {
		super()
		triggerCounter()

		// Attach components
		const input = (this.input = this.attach(new Input(this)))
		const tunnel = (this.tunnel = this.attach(new Tunnel(id)))
		const dom = (this.dom = this.attach(
			new Dom({
				id: "dummy",
				type: "html",
				input: this.input,
			}),
		))
		const carry = (this.carry = this.attach(new Carry({ input: this.input, dom: this.dom })))

		// Render elements
		this.dom.cullBounds.set([HALF, HALF])
		const back = (this.back = new Ellipse({ input: this.input }))
		const front = (this.front = new Ellipse({ input: this.input }))
		this.dom.append(this.back.dom)
		// this.dom.append(this.front.dom)

		// Styles!
		setCellStyles({ front, back, input, tunnel })
	}
}
