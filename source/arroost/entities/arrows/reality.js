import {
	BLACK,
	BLUE,
	CYAN,
	GREY,
	SILVER,
	Splash,
	WHITE,
	equals,
} from "../../../../libraries/habitat-import.js"
import { GREY_SILVER, shared } from "../../../main.js"
import {
	createCell,
	fireCell,
	fullFireCell,
	getCell,
	isFiring,
	modifyCell,
	t,
	unfireCell,
} from "../../../nogan/nogan.js"
import { Tunnel } from "../../components/tunnel.js"
import { Dom } from "../../components/dom.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Carry } from "../../components/carry.js"
import { Input } from "../../components/input.js"
import { setCellStyles } from "./shared.js"
import { FULL, HALF, QUARTER, SIXTH, THIRD } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { EllipseHtml } from "../shapes/ellipse-html.js"
import { RectangleHtml } from "../shapes/rectangle-html.js"
import { Rectangle } from "../shapes/rectangle.js"
import { PULSE_COLOURS } from "../../../nogan/schema.js"
import { Infinite } from "../../components/infinite.js"

export class ArrowOfReality extends Entity {
	/**
	 * @param {{
	 * 	id?: CellId
	 * 	position?: [number, number]
	 *  fire?: Fire
	 *  preview?: boolean
	 * }} options
	 */
	constructor({
		position = t([0, 0]),
		id = createCell(shared.nogan, { parent: shared.level, type: "reality", position }).id,
		fire = {
			red: null,
			green: null,
			blue: null,
		},
		preview = false,
	} = {}) {
		super()

		triggerCounter()

		// Attach components
		this.input = this.attach(new Input(this))
		this.dom = this.attach(
			new Dom({
				id: "reality",
				type: "html",
				input: this.input,
				position,
				// cullBounds: [(FULL * 2) / 3, (FULL * 2) / 3],
			}),
		)
		this.infinite = this.attach(new Infinite({ dom: this.dom, isPreview: preview }))
		this.tunnel = this.attach(new Tunnel(id, { entity: this }))
		this.carry = this.attach(new Carry({ input: this.input, dom: this.dom }))

		// Render elements
		this.back = this.attach(new RectangleHtml({ input: this.input }))
		this.front = this.attach(new Rectangle())
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		this.back.dom.transform.scale.set([1, 1])
		this.front.dom.transform.scale.set([4 / 5, 4 / 5])
		setCellStyles({
			back: this.back.dom,
			front: this.front.dom,
			input: this.input,
			tunnel: this.tunnel,
			infinite: this.infinite,
		})

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onPointingPointerUp.bind(this)

		Tunnel.perform(() => {
			const operations = []
			for (const key in fire) {
				if (fire[key] === null) continue
				// @ts-expect-error: `Fire` is typed correctly, but `fire` may theoretically be a subtype with additional keys
				operations.push(...fireCell(shared.nogan, { id, colour: key }))
			}
			return operations
		})
	}

	onPointingPointerUp(e) {
		Tunnel.perform(() => {
			const cell = getCell(shared.nogan, this.tunnel.id)
			if (!cell) return []

			const operations = []
			for (const colour of PULSE_COLOURS) {
				operations.push(...unfireCell(shared.nogan, { id: this.tunnel.id, colour }))
			}
			if (operations.length > 0) return operations

			return fullFireCell(shared.nogan, { id: this.tunnel.id })
		})
	}
}
