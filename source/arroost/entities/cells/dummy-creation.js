import {
	BLACK,
	BLUE,
	CYAN,
	GREY,
	SILVER,
	Splash,
	WHITE,
	add,
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
import { getCellBackgroundColour, getCellForegroundColour, setCellStyles } from "./shared.js"
import { Dummy } from "./dummy.js"
import { FULL, HALF, QUARTER, SIXTH, THIRD } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { progressUnlock, unlocks } from "../unlock.js"
import { EllipseHtml } from "../shapes/ellipse-html.js"

export class DummyCreation extends Entity {
	/**
	 * @param {{
	 * 	id?: CellId
	 * 	position?: [number, number]
	 * }} options
	 */
	constructor({
		id = createCell(shared.nogan, { type: "dummy-creation" }).id,
		position = t([0, 0]),
	}) {
		super()
		triggerCounter()

		// Attach components
		this.input = this.attach(new Input(this))
		this.tunnel = this.attach(new Tunnel(id, { entity: this }))
		this.dom = this.attach(
			new Dom({
				id: "dummy-creation",
				type: "html",
				input: this.input,
				cullBounds: [HALF, HALF],
				position,
			}),
		)
		this.carry = this.attach(new Carry({ input: this.input, dom: this.dom }))

		// Render elements
		this.back = this.attach(new EllipseHtml({ input: this.input }))
		this.front = this.attach(new Ellipse())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		this.back.dom.transform.scale.set([1, 1])
		this.front.dom.transform.scale.set([1 / 2, 1 / 2])
		setCellStyles({
			back: this.back.dom,
			front: this.front.dom,
			input: this.input,
			tunnel: this.tunnel,
		})

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		this.tunnel.useCell({ dom: this.dom, carry: this.carry, input: this.input })
	}

	onClick(e) {
		if (unlocks.destruction.unlocked) {
			progressUnlock("dummy-connection")
		}
		progressUnlock("destruction")

		Tunnel.perform(() => {
			return fireCell(shared.nogan, { id: this.tunnel.id })
		})

		const count = e.button === 0 && !e.ctrlKey ? 1 : 5

		let n = 0
		for (let i = 0; i < count; i++) {
			if (i % 1 === 0) n++
			// setTimeout(() => {
			const dummy = new Dummy({
				position: this.dom.transform.position.get(),
			})

			shared.scene.layer.cell.append(dummy.dom)
			const angle = Math.random() * Math.PI * 2
			const speed = e.button === 0 && !e.ctrlKey ? 15 : randomBetween(10, 18)
			const velocity = t([Math.cos(angle) * speed, Math.sin(angle) * speed])
			dummy.carry.movement.velocity.set(velocity)
			// }, n * 1)
		}
	}
}
