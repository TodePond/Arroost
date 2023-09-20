import {
	BLACK,
	BLUE,
	CYAN,
	GREY,
	SILVER,
	Splash,
	WHITE,
	equals,
} from "../../../../libraries/habitat-import.js"
import { GREY_SILVER, shared } from "../../../main.js"
import { createCell, fireCell, getCell, modifyCell, t } from "../../../nogan/nogan.js"
import { Tunnel } from "../../components/tunnel.js"
import { Dom } from "../../components/dom.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Carry } from "../../components/carry.js"
import { Input } from "../../components/input.js"
import { setCellStyles } from "./shared.js"
import { FULL, HALF, QUARTER, SIXTH, THIRD } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { EllipseHtml } from "../shapes/ellipse-html.js"
import { Triangle } from "../shapes/triangle.js"

export class ControlWire extends Entity {
	/**
	 * @param {{
	 * 	id?: CellId
	 * 	position?: [number, number]
	 * }} options
	 */
	constructor({
		position = t([0, 0]),
		id = createCell(shared.nogan, { type: "control-wire", position }).id,
	} = {}) {
		super()

		triggerCounter()

		// Attach components
		const input = (this.input = this.attach(new Input(this)))
		const tunnel = (this.tunnel = this.attach(new Tunnel(id, { concrete: false })))
		const dom = (this.dom = this.attach(
			new Dom({
				id: "dummy",
				type: "html",
				input: this.input,
				position,
				cullBounds: [(FULL * 2) / 3, (FULL * 2) / 3],
			}),
		))

		// Render elements
		const back = (this.back = new EllipseHtml({ input: this.input }))
		const front = (this.front = new Triangle())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		this.back.dom.transform.scale.set([2 / 3, 2 / 3])
		this.front.dom.transform.scale.set([1 / 2, 1 / 2])
		// this.front.dom.transform.position.set([0, (FULL - Triangle.HEIGHT) / 2])
		setCellStyles({ back: back.dom, front: front.dom, input, tunnel })

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		pointing.pointermove = this.onPointingPointerMove.bind(this)
		this.tunnel.useCell({ dom, input })
	}

	onPointingPointerMove() {
		// todo: drag the whole wire(s)?
		return null
	}

	onClick(e) {
		// this.tunnel.perform(() => {
		// 	return fireCell(shared.nogan, { id: this.tunnel.id })
		// })
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
