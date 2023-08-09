import { GREY, glue } from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { createCell, fireCell, modifyCell } from "../../../nogan/nogan.js"
import { getAudioContext, makeBufferSource, record } from "../../audio/audio.js"
import { INNER_RATIO } from "../../unit.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Thing } from "../thing.js"
import { Carryable } from "./carryable.js"
import { ArrowOfNoise } from "./noise.js"
import { getCellBackground } from "./util.js"

export const ArrowOfRecording = class extends Carryable {
	recordingStartTime = this.use(null)

	inner = new Ellipse()
	noiseHolder = new Thing()
	noise = this.use(null, { store: false })

	isRecording = this.use(false)

	stop = () => {}

	constructor(cell = createCell(shared.nogan, { type: "recording", parent: shared.level }).id) {
		super()
		const { style } = this
		glue(this)

		this.cell = cell
		this.add(this.noiseHolder)
		this.add(this.inner)

		this.inner.transform.scale = [INNER_RATIO, INNER_RATIO]
		this.inner.input = this.input

		this.colour = this.use(() => GREY)
		this.bgColour = this.snuse(() => getCellBackground(this.cell), { store: false })

		this.use(() => (this.inner.style.fill = this.colour.value))
		this.use(() => (this.style.fill = this.bgColour.value))

		this.use(() => {
			modifyCell(shared.nogan, { id: this.cell, position: this.transform.absolutePosition })
		})

		style.stroke = "none"
		style.fill = GREY
	}

	onPointingPointerUp() {
		if (this.noise === null) {
			this.onRecordStart()
		} else if (this.isRecording) {
			this.onRecordStop()
		} else {
			this.onPlayStart()
		}
	}

	tick() {
		super.tick()
		if (this.isRecording) {
			const difference = this.noise.duration - this.noise.trimEnd
			this.noise.duration = shared.time - this.recordingStartTime
			this.noise.trimEnd = this.noise.duration - difference
		}
	}

	async onRecordStart() {
		this.noise = new ArrowOfNoise()
		this.noiseHolder.add(this.noise)
		this.noise.sendToBack()
		this.recordingStartTime = shared.time

		this.isRecording = true
		this.stop = await record()
		fireCell(shared.nogan, { id: this.cell })
	}

	async onRecordStop() {
		this.isRecording = false
		this.recording = await this.stop()
		fireCell(shared.nogan, { id: this.cell })
	}

	async onPlayStart() {
		const context = getAudioContext()
		const source = makeBufferSource(this.recording)
		const semitones = 0
		source.playbackRate.value = 2 ** (semitones / 12)
		source.connect(context.destination)
		source.start(
			context.currentTime,
			this.noise.startingPoint / 1000,
			this.noise.trimEnd / 1000 - this.noise.startingPoint / 1000,
		)
		fireCell(shared.nogan, { id: this.cell })
		this.bgColour.update()
	}
}
