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
import { shared } from "../../../main.js"
import {
	createCell,
	fireCell,
	fullFireCell,
	getCell,
	modifyCell,
	t,
} from "../../../nogan/nogan.js"
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
import { Infinite } from "../../components/infinite.js"

export class ArrowOfDummy extends Entity {
	/**
	 * @param {{
	 * 	id?: CellId
	 * 	position?: [number, number]
	 * 	preview?: boolean
	 * }} options
	 */
	constructor({
		position = t([0, 0]),
		id = createCell(shared.nogan, { parent: shared.level, type: "dummy", position }).id,
		preview = false,
	} = {}) {
		super()

		triggerCounter()

		// Attach components
		this.input = this.attach(new Input(this))
		this.dom = this.attach(
			new Dom({
				id: "dummy",
				type: "html",
				input: this.input,
				position,
				cullBounds: [(FULL * 2) / 3, (FULL * 2) / 3],
			}),
		)
		this.infinite = this.attach(new Infinite({ dom: this.dom, isPreview: preview }))
		this.tunnel = this.attach(new Tunnel(id, { entity: this }))
		this.carry = this.attach(new Carry({ input: this.input, dom: this.dom }))

		// Render elements
		this.back = this.attach(new EllipseHtml({ input: this.input }))
		this.front = this.attach(new Ellipse())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		this.back.dom.transform.scale.set([2 / 3, 2 / 3])
		this.front.dom.transform.scale.set([1 / 3, 1 / 3])
		setCellStyles({
			back: this.back.dom,
			front: this.front.dom,
			input: this.input,
			tunnel: this.tunnel,
			infinite: this.infinite,
		})

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
	}

	onClick(e) {
		Tunnel.perform(() => {
			return fullFireCell(shared.nogan, { id: this.tunnel.id })
		})

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
