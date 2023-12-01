import { shared } from "../../../main.js"
import {
	createCell,
	deleteCell,
	deleteWire,
	fireCell,
	fullFireCell,
	getCell,
	getWire,
	t,
} from "../../../nogan/nogan.js"
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
import { ArrowOfDummy } from "./dummy.js"
import { replenishUnlocks, unlocks } from "../unlock.js"
import { Targeter } from "../shapes/targeter.js"

export class ArrowOfDestruction extends Entity {
	pulling = this.use(false)

	constructor({
		id = createCell(shared.nogan, { type: "destruction" }).id,
		position = t([0, 0]),
	}) {
		super()
		triggerCounter()

		// Attach components
		this.input = this.attach(new Input(this))
		this.tunnel = this.attach(new Tunnel(id, { entity: this }))
		this.dom = this.attach(
			new Dom({
				id: "destruction",
				type: "html",
				input: this.input,
				cullBounds: [HALF, HALF],
				position,
			}),
		)
		this.carry = this.attach(new Carry({ input: this.input, dom: this.dom }))

		// Render elements
		this.back = this.attach(new EllipseHtml({ input: this.input }))
		this.front = this.attach(new Plus())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		this.arrow = this.attach(new Targeter())
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
		this.front.dom.transform.scale.set([3 / 4, 3 / 4])
		setCellStyles({
			front: this.front.dom,
			back: this.back.dom,
			input: this.input,
			tunnel: this.tunnel,
		})
		this.front.dom.transform.rotation.set(Math.PI / 4)

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)

		targeting.pointerup = this.onTargetingPointerUp.bind(this)
	}

	// Type isn't correct here, but it works out ok
	template = ArrowOfDummy

	/** @type {null | Input} */
	source = null

	/** @type {Set<Input & {entity: Entity & {tunnel: Tunnel}}>} */
	targets = new Set()

	onClick(e) {
		this.template = ArrowOfDummy
		this.source = this.input
		return new Pulling()
	}

	onTargetingPointerUp(e) {
		const target = e.state.target
		if (!target.isDestroyable()) {
			return
		}

		this.tunnel.isFiring.set(true)
		Tunnel.perform(() => {
			if (!getCell(shared.nogan, this.tunnel.id)) return []
			return fullFireCell(shared.nogan, { id: this.tunnel.id })
		})

		Tunnel.perform(() => {
			const id = target.entity.tunnel.id
			if (id < 0) {
				throw new Error("Wait, you clicked on a wire? How??")
			}
			const cell = getCell(shared.nogan, id)
			if (!cell) return []
			if (cell.type === "timing") {
				const wire = getWire(shared.nogan, cell.wire)
				return deleteWire(shared.nogan, wire.id)
			}
			const operations = deleteCell(shared.nogan, id)
			replenishUnlocks()
			return operations
		})
	}
}
