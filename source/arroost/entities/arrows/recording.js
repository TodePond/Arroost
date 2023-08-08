import {
	BLACK,
	GREY,
	SILVER,
	WHITE,
	glue,
	repeatArray,
} from "../../../../libraries/habitat-import.js"
import { shared } from "../../../main.js"
import { getAudioContext, makeBufferSource, record } from "../../audio/audio.js"
import { INNER_RATIO } from "../../unit.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Thing } from "../thing.js"
import { Carryable } from "./carryable.js"
import { ArrowOfNoise } from "./noise.js"

export const ArrowOfRecording = class extends Carryable {
	recordingStartTime = this.use(null)

	inner = new Ellipse()
	noiseHolder = new Thing()
	noise = this.use(null, { store: false })

	isRecording = this.use(false)
	isPulsing = this.use(false)

	stop = () => {}

	constructor(
		layer = shared.nogan.current,
		// nod = createNod(layer, { type: "recording" })
	) {
		super()
		const { style } = this
		glue(this)
		this.layer = layer
		this.nod = undefined //nod
		this.add(this.noiseHolder)
		this.add(this.inner)

		this.inner.transform.scale = repeatArray([INNER_RATIO], 2)
		this.inner.input = this.input

		const colour = this.use(
			() => {
				if (this.isPulsing) return BLACK
				if (this.input.Pointing) return WHITE
				return SILVER
			},
			{ store: false },
		)

		this.use(() => {
			this.inner.style.fill = colour.value
		})
		this.use(() => {
			// modifyNod(this.layer, { id: this.nod.id, position: this.transform.absolutePosition })
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
	}

	async onRecordStop() {
		this.isRecording = false
		this.recording = await this.stop()
	}

	async onPlayStart() {
		this.isPulsing = true
		// addPulse(this.layer, { id: this.nod.id })
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
	}
}
