import { shared } from "../../../main.js"
import { createCell, fireCell, t } from "../../../nogan/nogan.js"
import { Carry } from "../../components/carry.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { Tunnel } from "../../components/tunnel.js"
import { HALF, QUARTER } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"
import { setCellStyles } from "./shared.js"
import { Rectangle } from "../shapes/rectangle.js"
import { Plus } from "../shapes/plus.js"
import { Pulling } from "../../machines/pulling.js"
import { Line } from "../shapes/line.js"
import { EllipseHtml } from "../shapes/ellipse-html.js"
import { DummyCreation } from "./dummy-creation.js"
import { Dummy } from "./dummy.js"

export class DummyConnection extends Entity {
	pulling = this.use(false)

	constructor({
		id = createCell(shared.nogan, { type: "dummy-connection" }).id,
		position = t([0, 0]),
	}) {
		super()
		triggerCounter()

		// Attach components
		const input = (this.input = this.attach(new Input(this)))
		const tunnel = (this.tunnel = this.attach(new Tunnel(id)))
		const dom = (this.dom = this.attach(
			new Dom({
				id: "dummy-connection",
				type: "html",
				input: this.input,
				cullBounds: [HALF, HALF],
				position,
			}),
		))
		const carry = (this.carry = this.attach(new Carry({ input: this.input, dom: this.dom })))

		// Render elements
		const back = (this.back = new EllipseHtml({ input: this.input }))
		const front = (this.front = new Ellipse())
		const backFront = (this.backFront = new Ellipse())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)
		this.dom.append(this.backFront.dom)

		this.arrow = new Line({ parent: this.dom.transform })
		shared.scene.layer.ghost.append(this.arrow.dom)

		const pulling = this.input.state("pulling")
		const targeting = this.input.state("targeting")
		this.use(() => {
			if (pulling.active.get() || targeting.active.get()) {
				this.arrow.dom.style.visibility.set("visible")
			} else {
				this.arrow.dom.style.visibility.set("hidden")
			}
		}, [pulling.active, targeting.active])

		this.source = this.input
		this.use(() => {
			if (this.arrow.dom.style.visibility.get() === "hidden") return
			if (!this.source) {
				this.arrow.dom.transform.setAbsolutePosition(this.dom.transform.absolutePosition.get())
			} else {
				this.arrow.dom.transform.setAbsolutePosition(
					this.source.entity.dom.transform.absolutePosition.get(),
				)
			}
			const pointerPosition = shared.pointer.transform.absolutePosition.get()
			this.arrow.target.setAbsolutePosition(pointerPosition)
		}, [
			shared.pointer.transform.absolutePosition,
			this.source.entity.dom.transform.absolutePosition,
			this.arrow.dom.style.visibility,
		])

		// Styles!
		front.dom.transform.scale.set([2 / 3, 2 / 3])
		backFront.dom.transform.scale.set([1 / 3, 1 / 3])
		setCellStyles({ front: front.dom, back: back.dom, input, tunnel })
		this.use(() => {
			backFront.dom.style.fill.set(back.dom.style.fill.get())
		}, [back.dom.style.fill])

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		this.tunnel.useCell({ dom, carry, input })

		targeting.pointerup = this.onTargetingPointerUp.bind(this)
	}

	/** @type {null | Input} */
	source = null

	onClick(e) {
		this.source = null
		return new Pulling()
	}

	onTargetingPointerUp(e) {
		if (e.state.target === shared.scene.input) {
			this.source?.targeted.set(false)
			return
		}

		if (this.source) {
			print("CONNECT")
			this.source.targeted.set(false)

			return
		}

		this.template = e.state.target.entity.constructor
		this.source = e.state.target

		this.source?.targeted.set(true)

		return new Pulling(this.input, e.state.target)
	}
}
