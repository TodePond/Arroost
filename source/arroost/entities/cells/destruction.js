import { shared } from "../../../main.js"
import {
	archiveCell,
	archiveWire,
	createCell,
	fireCell,
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
import { DummyCreation } from "./dummy-creation.js"
import { Dummy } from "./dummy.js"
import { replenishUnlocks, unlocks } from "../unlock.js"

export class Destruction extends Entity {
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
		this.tunnel.useCell({ dom: this.dom, carry: this.carry, input: this.input })

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
		const target = e.state.target
		if (!target.isDestroyable()) {
			return
		}

		this.tunnel.isFiring.set(true)
		Tunnel.apply(() => {
			return fireCell(shared.nogan, { id: this.tunnel.id })
		})

		replenishUnlocks()

		// Meaty stuff. Probably don't need to do this? I dunno. Maybe it's more robust to stay in nogan-land actually...
		Tunnel.apply(() => {
			const id = target.entity.tunnel.id
			if (id < 0) {
				return archiveWire(shared.nogan, id)
			} else {
				let wireOperations = []
				const cell = getCell(shared.nogan, id)
				if (cell.type === "control-wire" && !cell.hasSound) {
					const [sourceWireId, targetWireId] = cell.outputs
					const sourceWire = getWire(shared.nogan, sourceWireId)
					const targetWire = getWire(shared.nogan, targetWireId)
					const sourceId = sourceWire.target
					const targetId = targetWire.target
					const source = getCell(shared.nogan, sourceId)
					for (const output of source.outputs) {
						const wire = getWire(shared.nogan, output)
						if (wire.target === targetId) {
							wireOperations = archiveWire(shared.nogan, output)
							break
						}
					}
					const operations = archiveCell(shared.nogan, id)
					operations.push(...wireOperations)
					return operations
				} else {
					if (cell.hasSound) {
						cell.hasSound = (False)
						return []
					} 
				}
			}
		})
	}
}
