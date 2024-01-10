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
import { RectangleHtml } from "../shapes/rectangle-html.js"
import { Rectangle } from "../shapes/rectangle.js"
import { TextInput } from "../shapes/text-input.js"

export class ArrowOfTyping extends Entity {
	/**
	 * @param {{
	 * 	id?: CellId
	 * 	position?: [number, number]
	 * }} options
	 */
	constructor({
		position = t([0, 0]),
		id = createCell(shared.nogan, { parent: shared.level, type: "slot", position }).id,
	} = {}) {
		super()

		triggerCounter()

		// Attach components
		this.input = this.attach(new Input(this))
		this.dom = this.attach(
			new Dom({
				id: "typing",
				type: "html",
				input: this.input,
				position,
				// cullBounds: [(FULL * 2) / 3, (FULL * 2) / 3],
			}),
		)
		this.tunnel = this.attach(new Tunnel(id, { entity: this }))
		this.carry = this.attach(new Carry({ input: this.input, dom: this.dom }))

		// Render elements
		this.back = this.attach(new RectangleHtml({ input: this.input }))
		this.front = this.attach(new TextInput())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		const height = (FULL * 3) / 4
		this.back.dimensions.set([THIRD, height])
		// this.back.dom.transform.position.set([-THIRD / 2, 0])
		// this.back.dom.transform.scale.set([2 / 3, 2 / 3])
		// this.front.dom.transform.scale.set([1 / 3, 1 / 3])
		this.front.dimensions.set(["200vw", height + "px"])
		this.front.dom.transform.position.set([THIRD / 2 + SIXTH / 2, -height / 2])
		this.front.dom.style.fontSize.set((height * 2) / 3)
		this.front.dom.style.fontFamily.set("Rosario")
		const element = this.front.dom.getElement()
		if (element) {
			element.style.outline = "none"
		}
		setCellStyles({
			back: this.back.dom,
			front: null,
			// front: this.front.dom,
			input: this.input,
			tunnel: this.tunnel,
			infinite: null,
		})

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
	}

	onClick(e) {
		this.front.dom.getElement()?.focus()

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
