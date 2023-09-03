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
import { getCellBackgroundColour, getCellForegroundColour, setCellStyles } from "./util.js"
import { Dummy } from "./dummy.js"
import { FULL, HALF } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { replenishUnlocks, unlocks } from "../unlock.js"

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
		const front = (this.front = new Ellipse())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		this.back.dom.transform.scale.set([1, 1])
		this.front.dom.transform.scale.set([1 / 2, 1 / 2])
		setCellStyles({ back: back.dom, front: front.dom, input, tunnel })

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		this.tunnel.useCell({ dom, carry, input })
	}

	onClick(e) {
		if (!unlocks["creation"].unlocked) {
			unlocks["creation"].remaining--
			if (unlocks["creation"].remaining <= 0) {
				unlocks["creation"].unlocked = true
				replenishUnlocks(this)
			}
		}

		this.tunnel.perform(() => {
			return fireCell(shared.nogan, { id: this.tunnel.id })
		})

		const count = e.button === 0 ? 1 : 10

		let n = 0
		for (let i = 0; i < count; i++) {
			if (i % 1 === 0) n++
			// setTimeout(() => {
			const dummy = new Dummy({
				position: this.dom.transform.position.get(),
			})

			shared.scene.layer.cell.append(dummy.dom)
			const angle = Math.random() * Math.PI * 2
			const speed = e.button === 0 ? 15 : randomBetween(10, 30)
			const velocity = t([Math.cos(angle) * speed, Math.sin(angle) * speed])
			dummy.carry.movement.velocity.set(velocity)
			// }, n * 20)
		}
	}
}
