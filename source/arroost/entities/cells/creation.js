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
import { progressUnlock, unlocks } from "../unlock.js"

export class Creation extends Entity {
	pulling = this.use(false)

	constructor({ id = createCell(shared.nogan, { type: "creation" }).id, position = t([0, 0]) }) {
		super()
		triggerCounter()

		// Attach components
		const input = (this.input = this.attach(new Input(this)))
		const tunnel = (this.tunnel = this.attach(new Tunnel(id)))
		const dom = (this.dom = this.attach(
			new Dom({
				id: "creation",
				type: "html",
				input: this.input,
				cullBounds: [HALF, HALF],
				position,
			}),
		))
		const carry = (this.carry = this.attach(new Carry({ input: this.input, dom: this.dom })))

		// Render elements
		const back = (this.back = new EllipseHtml({ input: this.input }))
		const front = (this.front = new Plus())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

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
			if (!this.source) return
			if (this.arrow.dom.style.visibility.get() === "hidden") return
			this.arrow.dom.transform.setAbsolutePosition(
				this.source.entity.dom.transform.absolutePosition.get(),
			)
			const pointerPosition = shared.pointer.transform.absolutePosition.get()
			this.arrow.target.setAbsolutePosition(pointerPosition)
		}, [
			shared.pointer.transform.absolutePosition,
			this.source.entity.dom.transform.absolutePosition,
			this.arrow.dom.style.visibility,
		])

		// Styles!
		front.dom.transform.scale.set([3 / 4, 3 / 4])
		setCellStyles({ front: front.dom, back: back.dom, input, tunnel })

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		this.tunnel.useCell({ dom, carry, input })

		targeting.pointerup = this.onTargetingPointerUp.bind(this)
	}

	// Type isn't correct here, but it works out ok
	template = Dummy

	/** @type {null | Input} */
	source = null

	/** @type {Set<Input & {entity: Entity & {tunnel: Tunnel}}>} */
	targets = new Set()

	onClick(e) {
		this.template = Dummy
		this.source = this.input
		return new Pulling()
	}

	onTargetingPointerUp(e) {
		if (!e.state.target.isCloneable()) {
			const dummy = new this.template({
				position: shared.pointer.transform.absolutePosition.get(),
			})

			shared.scene.layer.cell.append(dummy.dom)
			this.tunnel.isFiring.set(true)
			this.tunnel.perform(() => {
				return fireCell(shared.nogan, { id: this.tunnel.id })
			})

			for (const target of this.targets) {
				target.targeted.set(false)
				target.entity.tunnel.isFiring.set(true)
				target.entity.tunnel.perform(() => {
					return fireCell(shared.nogan, { id: target.entity.tunnel.id })
				})
			}
			this.targets.clear()

			progressUnlock("dummy-connection", this)

			return
		}

		this.template = e.state.target.entity.constructor
		this.source = e.state.target
		this.targets.add(e.state.target)
		e.state.target.targeted.set(true)

		return new Pulling(this.input, e.state.target)
	}
}
