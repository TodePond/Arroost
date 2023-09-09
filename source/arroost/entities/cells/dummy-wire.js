import { Carry } from "../../components/carry.js"
import { Dom } from "../../components/dom.js"
import { Tunnel } from "../../components/tunnel.js"
import { HALF } from "../../unit.js"
import { Entity } from "../entity.js"
import { Line } from "../shapes/line.js"

export class DummyWire extends Entity {
	/**
	 *
	 * @param {WireId} id
	 */
	constructor(id) {
		super()

		// Attach components
		const tunnel = (this.tunnel = this.attach(new Tunnel(id)))
		const dom = (this.dom = this.attach(
			new Dom({
				id: "dummy-wire",
				type: "html",
			}),
		))

		// Render elements
		const line = (this.line = this.attach(new Line()))
		this.dom.append(line.dom)
	}
}
