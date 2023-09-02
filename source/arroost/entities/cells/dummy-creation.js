import {
	BLACK,
	BLUE,
	CYAN,
	GREY,
	SILVER,
	Splash,
	WHITE,
	randomBetween,
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
import { Dummy } from "./dummy.js"
import { FULL, HALF } from "../../unit.js"

export class DummyCreation extends Entity {
	/**
	 * @param {CellId} id
	 */
	constructor(id = createCell(shared.nogan, { type: "dummy-creation" }).id) {
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
		this.dom.cullBounds.set([HALF, HALF])
		const back = (this.back = new Ellipse({ input: this.input }))
		const front = (this.front = new Ellipse({ input: this.input }))
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		this.back.dom.transform.scale.set([1, 1])
		this.front.dom.transform.scale.set([1 / 2, 1 / 2])
		setCellColours({ back, front, input, tunnel })

		// Custom behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		this.tunnel.useCell({ dom, carry })
	}

	onClick(e) {
		this.tunnel.perform(() => {
			return fireCell(shared.nogan, { id: this.tunnel.id })
		})

		const count = e.button === 0 ? 1 : 20

		for (let i = 0; i < count; i++) {
			setTimeout(() => {
				const dummy = new Dummy()
				shared.scene.layer.cell.append(dummy.dom)
				const angle = Math.random() * Math.PI * 2
				const speed = e.button === 0 ? 15 : randomBetween(15, 30)
				const velocity = t([Math.cos(angle) * speed, Math.sin(angle) * speed])
				dummy.dom.transform.position.set(this.dom.transform.position.get())
				dummy.carry.movement.velocity.set(velocity)
			}, i * 1)
		}
	}
}
