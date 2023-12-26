import { Dom } from "../../components/dom.js"
import { Entity } from "../entity.js"
import { Carry } from "../../components/carry.js"
import { Input } from "../../components/input.js"
import { setCellStyles } from "./shared.js"
import { ArrowOfRecording } from "./recording.js"
import { RectangleHtml } from "../shapes/rectangle-html.js"
import { GREY_SILVER, shared } from "../../../main.js"
import { GREY } from "../../../../libraries/habitat-import.js"
import { FIFTH, FULL, HALF, TENTH, THIRD } from "../../unit.js"

export class ArrowOfNoise extends Entity {
	/**
	 * @param {ArrowOfRecording} recording
	 */
	constructor(recording) {
		super()

		this.recording = recording
		this.duration = this.use(
			() => this.recording.recordingDuration.get() ?? 0,
			[this.recording.recordingDuration],
		)

		// Attach components
		this.input = this.attach(new Input(this))
		this.dom = this.attach(
			new Dom({
				id: "noise",
				type: "html",
				input: this.input,
				// TODO: add cull bounds
			}),
		)

		// TODO: constrain to x axis
		this.carry = this.attach(
			new Carry({
				input: this.input,
				dom: this.dom,
				constrain: [false, true],
				raise: false,
			}),
		)

		// Render elements
		this.stem = this.attach(new RectangleHtml({ input: this.input }))
		this.dom.append(this.stem.dom)

		// Style elements
		setCellStyles({
			back: this.stem.dom,
			front: null,
			input: this.input,
			tunnel: null,
			infinite: null,
		})

		this.stem.dimensions.set([FULL, this.height.get()])

		// this.dom.transform.position.set([TENTH, 0])

		this.use(() => {
			const width = this.duration.get() * FULL + FULL - FIFTH
			this.stem.dimensions.set([this.duration.get() * FULL + FULL - FIFTH, this.height.get()])
			this.stem.dom.transform.position.set([width / 2 - FIFTH * 1.71, 0])
		}, [this.duration])
	}

	height = this.use((FULL * 2) / 5)
}
