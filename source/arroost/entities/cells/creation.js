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
import { setCellStyles } from "./util.js"
import { Rectangle } from "../shapes/rectangle.js"
import { Plus } from "../shapes/plus.js"
import { Targeting } from "../../machines/targeting.js"
import { Line } from "../shapes/line.js"
import { EllipseHtml } from "../shapes/ellipse-html.js"

export class Creation extends Entity {
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
			}),
		))
		const carry = (this.carry = this.attach(new Carry({ input: this.input, dom: this.dom })))

		// Render elements
		const back = (this.back = new EllipseHtml({ input: this.input }))
		const front = (this.front = new Plus())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		this.arrow = new Line({ parent: this.dom.transform })
		this.dom.append(this.arrow.dom)

		const targeting = this.input.state("targeting")
		this.use(() => {
			if (targeting.active.get()) {
				this.arrow.dom.style.visibility.set("visible")
			} else {
				this.arrow.dom.style.visibility.set("hidden")
			}
		}, [targeting.active])

		this.use(() => {
			if (this.arrow.dom.style.visibility.get() === "hidden") return
			const pointerPosition = shared.pointer.transform.absolutePosition.get()
			this.arrow.target.setAbsolutePosition(pointerPosition)
		}, [shared.pointer.transform.absolutePosition, this.arrow.dom.style.visibility])

		// Styles!
		front.dom.transform.scale.set([3 / 4, 3 / 4])
		setCellStyles({ front: front.dom, back: back.dom, input, tunnel })

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		this.tunnel.useCell({ dom, carry, input })

		// targeting.pointerdown = this.onTarget.bind(this)
	}

	onClick(e) {
		return new Targeting()
	}

	onTarget(e) {
		print("target")
	}
}
