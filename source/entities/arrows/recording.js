import { GREY, SILVER, WHITE, glue, repeatArray } from "../../../libraries/habitat-import.js"
import { getAudioContext, makeBufferSource, record } from "../../audio/audio.js"
import { shared } from "../../main.js"
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

	colour = this.use(
		() => {
			if (this.input.Pointing) return WHITE
			return SILVER
		},
		{ store: false },
	)

	constructor() {
		super()
		const { style } = this
		glue(this)
		this.add(this.noiseHolder)
		this.add(this.inner)

		this.inner.transform.scale = repeatArray([INNER_RATIO], 2)
		this.inner.input = this.input
		this.use(() => (this.inner.style.fill = this.colour))

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
