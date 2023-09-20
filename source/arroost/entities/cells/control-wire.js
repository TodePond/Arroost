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
import { createCell, fireCell, getCell, modifyCell, modifyWire, t } from "../../../nogan/nogan.js"
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
	/** @type {Signal<Timing>} */
	timing = this.use(0)

	/**
	 * @param {{
	 * 	id?: CellId
	 * 	position?: [number, number]
	 *  wire: WireId
	 * }} options
	 */
	constructor({
		position = t([0, 0]),
		id = createCell(shared.nogan, { type: "control-wire", position }).id,
		wire,
	}) {
		super()

		triggerCounter()

		// Attach components
		const input = (this.input = this.attach(new Input(this)))
		const tunnel = (this.tunnel = this.attach(new Tunnel(id, { concrete: false })))
		const dom = (this.dom = this.attach(
			new Dom({
				id: "control-wire",
				type: "html",
				input: this.input,
				position,
				cullBounds: [(FULL * 2) / 3, (FULL * 2) / 3],
			}),
		))

		// Render elements
		const back = (this.back = new EllipseHtml({ input: this.input }))
		const front = (this.front = new Triangle())
		const delayFront = (this.delayFront = new Triangle())
		const earlyFront = (this.earlyFront = new Ellipse())
		const earlyFrontFront = (this.earlyFrontFront = new Triangle())

		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)
		this.dom.append(this.delayFront.dom)
		this.dom.append(this.earlyFront.dom)
		this.dom.append(this.earlyFrontFront.dom)

		// Style elements
		this.back.dom.transform.scale.set([2 / 3, 2 / 3])
		this.front.dom.transform.scale.set([1 / 3, 1 / 3])
		this.earlyFrontFront.dom.transform.scale.set([1 / 4, 1 / 4])
		this.delayFront.dom.transform.scale.set([1 / 4, 1 / 4])

		this.earlyFront.dom.transform.scale.set([((2 / 3) * 2) / 3, ((2 / 3) * 2) / 3])
		// this.earlyFront.dom.transform.scale.set([1 / 7, 1 / 7])
		// this.front.dom.transform.position.set([0, (FULL - Triangle.HEIGHT) / 2])
		setCellStyles({ back: back.dom, front: front.dom, input, tunnel })
		this.use(() => {
			if (this.timing.get() !== 1) return
			this.delayFront.dom.style.fill.set(this.back.dom.style.fill.get())
		}, [this.timing, this.back.dom.style.fill])

		this.use(() => {
			if (this.timing.get() !== -1) return
			this.earlyFrontFront.dom.style.fill.set(this.back.dom.style.fill.get())
		}, [this.timing, this.back.dom.style.fill])

		this.use(() => {
			if (this.timing.get() !== -1) return
			this.earlyFront.dom.style.fill.set(this.front.dom.style.fill.get())
		}, [this.timing, this.back.dom.style.fill])

		this.use(() => {
			const timing = this.timing.get()
			if (timing === 1) {
				this.delayFront.dom.style.visibility.set("inherit")
			} else {
				this.delayFront.dom.style.visibility.set("hidden")
			}
		}, [this.timing])

		this.use(() => {
			const timing = this.timing.get()
			if (timing === -1) {
				this.earlyFront.dom.style.visibility.set("inherit")
				this.earlyFrontFront.dom.style.visibility.set("inherit")
			} else {
				this.earlyFront.dom.style.visibility.set("hidden")
				this.earlyFrontFront.dom.style.visibility.set("hidden")
			}
		}, [this.timing])

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		pointing.pointermove = this.onPointingPointerMove.bind(this)
		this.tunnel.useCell({ dom, input })
		this.wire = wire
	}

	onPointingPointerMove() {
		// todo: drag the whole wire(s)?
		return null
	}

	onClick(e) {
		switch (this.timing.get()) {
			case 0: {
				this.timing.set(1)
				break
			}
			case 1: {
				this.timing.set(-1)
				break
			}
			case -1: {
				this.timing.set(0)
				break
			}
		}

		this.tunnel.apply(() => {
			return modifyWire(shared.nogan, { id: this.wire, timing: this.timing.get() })
		})

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
