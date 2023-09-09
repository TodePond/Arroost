import { shared } from "../../../main.js"
import { createWire } from "../../../nogan/nogan.js"
import { Carry } from "../../components/carry.js"
import { Dom } from "../../components/dom.js"
import { Tunnel } from "../../components/tunnel.js"
import { HALF } from "../../unit.js"
import { Entity } from "../entity.js"
import { Line } from "../shapes/line.js"

export class DummyTime extends Entity {
	/**
	 *
	 * @param {{
	 * 	id?: WireId
	 *  target: Entity & {dom: Dom, tunnel: Tunnel}
	 *  source: Entity & {dom: Dom, tunnel: Tunnel}
	 * }} options
	 */
	constructor({ id, target, source }) {
		super()

		// Setup tunnel
		if (id === undefined) {
			const { wire, operations } = createWire(shared.nogan, {
				source: source.tunnel.id,
				target: target.tunnel.id,
			})

			this.tunnel = this.attach(new Tunnel(wire.id))
			this.tunnel.apply(() => operations)
		} else {
			this.tunnel = this.attach(new Tunnel(id))
		}

		// Attach components
		this.dom = this.attach(
			new Dom({
				id: "dummy-time",
				type: "html",
			}),
		)
		this.source = source
		this.target = target

		// Render elements
		const line = (this.line = this.attach(new Line()))
		this.dom.append(line.dom)

		this.use(() => {
			const sourcePosition = this.source.dom.transform.absolutePosition.get()
			this.line.dom.transform.setAbsolutePosition(sourcePosition)
		}, [this.source.dom.transform.absolutePosition])

		this.use(() => {
			const targetPosition = this.target.dom.transform.absolutePosition.get()
			this.line.target.setAbsolutePosition(targetPosition)
		}, [this.target.dom.transform.absolutePosition, this.source.dom.transform.absolutePosition])
	}
}
