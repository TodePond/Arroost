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
	createWire,
	fullFireCell,
	getCell,
	getWire,
	modifyCell,
	modifyWire,
	t,
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
import { Triangle } from "../shapes/triangle.js"
import { ArrowOfConnection } from "./connection.js"
import { getNextTiming } from "../../../nogan/behave.js"
import { RectangleHtml } from "../shapes/rectangle-html.js"
import { Rectangle } from "../shapes/rectangle.js"

export class ArrowOfColour extends Entity {
	/** @type {Signal<WireColour>} */
	colour = this.use("any")

	/**
	 * @param {{
	 * 	id?: CellId
	 * 	position?: [number, number]
	 *  wire: WireId
	 * }} options
	 */
	constructor({ position = t([0, 0]), id, wire }) {
		super()

		triggerCounter()

		if (id === undefined) {
			const cell = createCell(shared.nogan, { parent: shared.level, type: "colour" })
			const wireWire = getWire(shared.nogan, wire)
			Tunnel.apply(() => {
				const operations = modifyCell(shared.nogan, {
					id: cell.id,
					wire,
				})

				const wireOperations = modifyWire(shared.nogan, {
					id: wire,
					cells: [...wireWire.cells, cell.id],
				})
				operations.push(...wireOperations)
				return operations
			})
			id = cell.id
		}

		// Attach components
		this.input = this.attach(new Input(this))
		this.dom = this.attach(
			new Dom({
				id: "timing",
				type: "html",
				input: this.input,
				position,
				cullBounds: [(FULL * 2) / 3, (FULL * 2) / 3],
			}),
		)
		this.tunnel = this.attach(new Tunnel(id, { destroyable: true, entity: this }))

		// Render elements
		this.back = this.attach(new RectangleHtml({ input: this.input }))
		this.front = this.attach(new Rectangle())
		// this.middle = this.attach(new Rectangle())

		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)
		// this.dom.append(this.middle.dom)

		// Style elements
		this.back.dom.transform.scale.set([3 / 5, 3 / 5])
		this.front.dom.transform.scale.set([3 / 10, 3 / 10])
		// this.middle.dom.transform.scale.set([1 / 3, 1 / 3])

		// this.back.dom.transform.position.set([(-FULL * 3) / 10, 0])

		setCellStyles({
			back: this.back.dom,
			front: this.front.dom,
			input: this.input,
			tunnel: this.tunnel,
			infinite: null,
		})
		this.colour.set(getWire(shared.nogan, wire).colour)

		// Nogan behaviours
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		pointing.pointermove = this.onPointingPointerMove.bind(this)
		this.wire = wire

		const wireEntity = Tunnel.get(wire)?.entity

		this.use(() => {
			if (!wireEntity) return
			wireEntity.wireColour?.set(this.colour.get())
		}, [this.colour])
	}

	onPointingPointerMove() {
		// todo: drag the whole wire(s)?
		return null
	}

	onClick(e) {
		switch (this.colour.get()) {
			case "any": {
				this.colour.set("red")
				break
			}
			case "red": {
				this.colour.set("green")
				break
			}
			case "green": {
				this.colour.set("blue")
				break
			}
			case "blue": {
				this.colour.set("any")
				break
			}
		}

		ArrowOfConnection.colour = this.colour.get()

		Tunnel.perform(() => {
			const wire = getWire(shared.nogan, this.wire)
			if (!wire) throw new Error(`Couldn't find wire ${this.wire}`)
			const colour = this.colour.get()
			this.colour.set(colour)
			const fireOperations = fullFireCell(shared.nogan, { id: this.tunnel.id })
			const modifyOperations = modifyWire(shared.nogan, { id: wire.id, colour })
			fireOperations.push(...modifyOperations)
			return fireOperations
		})
	}
}
