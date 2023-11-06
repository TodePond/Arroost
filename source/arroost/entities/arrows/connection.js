import { angleBetween, subtract } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { createCell, fireCell, t } from "../../../nogan/nogan.js"
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
import { progressUnlock } from "../unlock.js"
import { ArrowOfTime } from "./time.js"
import { setCellStyles } from "./shared.js"
import { ArrowOfSlot } from "./slot.js"

export class ArrowOfConnection extends Entity {
	pulling = this.use(false)

	constructor({
		id = createCell(shared.nogan, { type: "connection" }).id,
		position = t([0, 0]),
	}) {
		super()
		triggerCounter()

		// Attach components
		this.input = this.attach(new Input(this))
		this.tunnel = this.attach(new Tunnel(id, { entity: this }))
		this.dom = this.attach(
			new Dom({
				id: "connection",
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
		this.backFront = this.attach(new Ellipse())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)
		this.dom.append(this.backFront.dom)

		this.arrow = this.attach(new Line({ parent: this.dom.transform }))
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
		this.front.dom.transform.scale.set([2 / 3, 2 / 3])
		this.backFront.dom.transform.scale.set([1 / 3, 1 / 3])
		setCellStyles({
			front: this.front.dom,
			back: this.back.dom,
			input: this.input,
			tunnel: this.tunnel,
		})
		this.use(() => {
			this.backFront.dom.style.fill.set(this.back.dom.style.fill.get())
		}, [this.back.dom.style.fill])

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)

		targeting.pointerup = this.onTargetingPointerUp.bind(this)
	}

	/** @type {null | Input} */
	source = null

	onClick(e) {
		this.source = null
		return new Pulling()
	}

	/** @type {Timing} */
	static timing = 0

	onTargetingPointerUp(e) {
		if (this.source === this.input) {
			this.source = null
		}
		let target = e.state.target

		// Can we even connect to this thing?
		if (!target.isConnectable()) {
			// If we can't, let's create a slot instead!
			const slot = new ArrowOfSlot({
				position: shared.pointer.transform.absolutePosition.get(),
			})

			shared.scene.layer.cell.append(slot.dom)

			target = slot.input
		}

		// Do we not have a source yet?
		if (!this.source) {
			this.source = target
			this.source?.targeted.set(true)
			target.entity.dom.style.bringToFront()

			return new Pulling(this.input, target)
		}

		// We already have a source! Let's try to use this one as our target.

		// You can't connect to yourself
		if (target === this.source) {
			return new Pulling(this.input, target)
		}

		// You can't connect to something without a tunnel to nogan.
		const sourceEntity = this.source.entity
		if (!sourceEntity.tunnel) {
			throw new Error("Can't connect from an entity with no tunnel")
		}

		// Let's make the arroost entity.
		const entity = target.entity
		const dummyWire = new ArrowOfTime({
			// @ts-expect-error - Don't know why it isn't figuring out its type here.
			source: sourceEntity,
			target: entity,
			timing: ArrowOfConnection.timing,
		})

		// Add it to the scene!
		shared.scene.layer.wire.append(dummyWire.dom)

		// We're done here! Stop highlighting, etc...
		this.source.targeted.set(false)
		this.tunnel.isFiring.set(true)

		// Let's fire, for good measure!
		Tunnel.perform(() => {
			return fireCell(shared.nogan, { id: this.tunnel.id })
		})

		// Unlock the next thing!
		progressUnlock("destruction")
	}
}
