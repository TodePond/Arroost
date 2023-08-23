import {
	BLACK,
	BLUE,
	CYAN,
	GREY,
	SILVER,
	Splash,
	WHITE,
} from "../../../../libraries/habitat-import.js"
import { GREY_SILVER, shared } from "../../../main.js"
import { createCell, fireCell, t } from "../../../nogan/nogan.js"
import { Tunnel } from "../../components/tunnel.js"
import { Dom } from "../../components/dom.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Carry } from "../../components/carry.js"
import { Input } from "../../components/input.js"
import { getCellBackgroundColour, getCellForegroundColour, setCellColours } from "./util.js"

export class Dummy extends Entity {
	/**
	 * @param {CellId} id
	 */
	constructor(id = createCell(shared.nogan, { type: "dummy" }).id) {
		super()

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
		const back = (this.back = new Ellipse({ input: this.input }))
		const front = (this.front = new Ellipse({ input: this.input }))
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		this.back.dom.transform.scale.set([2 / 3, 2 / 3])
		this.front.dom.transform.scale.set([1 / 3, 1 / 3])
		setCellColours({ back, front, input, tunnel })

		// Custom behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
	}

	onClick(e) {
		this.tunnel.fire()

		// === Debug ===
		// const dummy = new Dummy()
		// shared.scene.dom.append(dummy.dom)
		// const angle = Math.random() * Math.PI * 2
		// const speed = 15
		// const velocity = t([Math.cos(angle) * speed, Math.sin(angle) * speed])
		// dummy.dom.transform.position.set(this.dom.transform.position.get())
		// dummy.carry.movement.velocity.set(velocity)
	}
}
