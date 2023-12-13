import { shared } from "../../../main.js"
import { createCell, fireCell, fullFireCell, getCell, t } from "../../../nogan/nogan.js"
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
import { progressUnlock, unlocks } from "../unlock.js"
import { ArrowOfRecording } from "./recording.js"
import { Targeter } from "../shapes/targeter.js"
import { ArrowOfReality } from "./reality.js"
import { Infinite } from "../../components/infinite.js"

export class ArrowOfCreation extends Entity {
	pulling = this.use(false)

	constructor({
		id = createCell(shared.nogan, { parent: shared.level, type: "creation" }).id,
		position = t([0, 0]),
	}) {
		super()
		triggerCounter()

		// Attach components
		this.input = this.attach(new Input(this))
		this.dom = this.attach(
			new Dom({
				id: "creation",
				type: "html",
				input: this.input,
				cullBounds: [HALF, HALF],
				position,
			}),
		)
		this.tunnel = this.attach(new Tunnel(id, { entity: this, isInfinite: true }))
		this.carry = this.attach(new Carry({ input: this.input, dom: this.dom }))
		this.infinite = this.attach(new Infinite({ dom: this.dom }))

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

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)

		targeting.pointerup = this.onTargetingPointerUp.bind(this)
	}

	// Type isn't correct here, but it works out ok
	template = ArrowOfRecording

	/** @type {null | Input} */
	source = null

	/** @type {Set<Input & {entity: Entity & {tunnel: Tunnel}}>} */
	targets = new Set()

	onClick(e) {
		this.template = ArrowOfRecording
		this.source = this.input
		return new Pulling()
	}

	/**
	 * @param {Entity} entity
	 */
	getTemplateArgs(entity) {
		if (entity instanceof ArrowOfRecording) {
			return { recordingKey: entity.recordingKey }
		}

		if (entity instanceof ArrowOfReality) {
			const cell = getCell(shared.nogan, entity.tunnel.id)
			if (!cell) throw new Error("No cell found for reality arrow")
			return { fire: cell.fire }
		}

		return {}
	}

	onTargetingPointerUp(e) {
		// If the thing is cloneable, let's continue targeting.
		// TODO: This should be whatever we pointer-down'd on, not what we pointer-up'd on.
		if (e.state.target.isCloneable()) {
			this.template = e.state.target.entity.constructor
			this.templateArgs = this.getTemplateArgs(e.state.target.entity)
			this.source = e.state.target
			this.targets.add(e.state.target)
			e.state.target.entity.dom.style.bringToFront()
			e.state.target.targeted.set(true)
			return new Pulling(this.input, e.state.target)
		}

		// If it's not cloneable, let's create a new thing!

		// Make the entity.
		/** @type {any} */
		const dummyArgs = {
			position: shared.pointer.transform.absolutePosition.get(),
			...this.templateArgs,
		}
		const dummy = new this.template(dummyArgs)

		// Add it to the scene.
		shared.scene.layer.cell.append(dummy.dom)

		// Fire myself!
		// this.tunnel.fire.set(this.tunnel.getFire())
		Tunnel.perform(() => {
			return fullFireCell(shared.nogan, { id: this.tunnel.id })
		})

		for (const target of this.targets) {
			target.targeted.set(false)
			// this.tunnel.fire.set(this.tunnel.getFire())
			// Tunnel.perform(() => {
			// 	return fullFireCell(shared.nogan, { id: target.entity.tunnel.id })
			// })
		}

		// We're done here.
		this.targets.clear()
		progressUnlock("connection")
	}
}
