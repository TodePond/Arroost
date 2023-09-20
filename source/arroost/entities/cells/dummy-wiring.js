import { angleBetween, subtract } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { createCell, t } from "../../../nogan/nogan.js"
import { Carry } from "../../components/carry.js"
import { Dom } from "../../components/dom.js"
import { Input } from "../../components/input.js"
import { Tunnel } from "../../components/tunnel.js"
import { Pulling } from "../../machines/pulling.js"
import { HALF, QUARTER } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { Entity } from "../entity.js"
import { EllipseHtml } from "../shapes/ellipse-html.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Line } from "../shapes/line.js"
import { DummyWire } from "./dummy-wire.js"
import { setCellStyles } from "./shared.js"

export class DummyWiring extends Entity {
	pulling = this.use(false)

	constructor({
		id = createCell(shared.nogan, { type: "dummy-wiring" }).id,
		position = t([0, 0]),
	}) {
		super()
		triggerCounter()

		// Attach components
		const input = (this.input = this.attach(new Input(this)))
		const tunnel = (this.tunnel = this.attach(new Tunnel(id)))
		const dom = (this.dom = this.attach(
			new Dom({
				id: "dummy-wiring",
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

			const pointerPosition = shared.pointer.transform.absolutePosition.get()
			if (!this.source) {
				const center = this.dom.transform.absolutePosition.get()
				const angle = angleBetween(center, pointerPosition)
				const distance = QUARTER
				const displacement = [distance * Math.cos(angle), distance * Math.sin(angle)]
				const position = subtract(center, displacement)
				this.arrow.dom.transform.setAbsolutePosition(position)
			} else {
				this.arrow.dom.transform.setAbsolutePosition(
					this.source.entity.dom.transform.absolutePosition.get(),
				)
			}

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
		if (!e.state.target.isConnectable()) {
			this.source?.targeted.set(false)
			return
		}

		if (this.source) {
			this.source.targeted.set(false)
			const sourceEntity = this.source.entity
			if (!sourceEntity.tunnel) {
				throw new Error("Can't connect from an entity with no tunnel")
			}
			const dummyWire = new DummyWire({
				// @ts-expect-error - don't know why it isn't figuring out its type here
				source: sourceEntity,
				target: e.state.target.entity,
			})
			shared.scene.layer.wire.append(dummyWire.dom)
			return
		}

		this.template = e.state.target.entity.constructor
		this.source = e.state.target
		this.source?.targeted.set(true)
		e.state.target.entity.dom.style.bringToFront()

		return new Pulling(this.input, e.state.target)
	}
}
