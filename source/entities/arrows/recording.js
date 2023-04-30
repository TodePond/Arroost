import { GREY, SILVER, WHITE, glue, repeatArray } from "../../../libraries/habitat-import.js"
import { getAudioContext, getWorklet, play, record } from "../../audio/audio.js"
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
	isPlaying = this.use(false)

	colour = this.use(
		() => {
			if (this.input.Pointing) return WHITE
			return SILVER
		},
		{ store: false },
	)

	constructor() {
		super()
		const { transform, style } = this
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
		//this.noise.transform.position.x = INNER_UNIT / 3
		this.recordingStartTime = shared.time

		this.isRecording = true
		//this.recorder.start()
		this.stop = await record()
	}

	async onRecordStop() {
		this.isRecording = false
		this.recording = await this.stop()
		this.trimmer = await getWorklet("trim")
		this.trimmer.connect(getAudioContext().destination)
		//this.recorder.stop()
	}

	updateTrim([start, end]) {
		if (this.isRecording) return
		if (!this.recording) return
		const trimStartParam = this.trimmer.parameters.get("trimStart")
		const trimEndParam = this.trimmer.parameters.get("trimEnd")
		trimStartParam.value = start / this.noise.duration
		trimEndParam.value = end / this.noise.duration
	}

	onPlayStart() {
		this.isPlaying = true
		play(this.recording, this.trimmer)
		//shared.audio.play(this.recorder)
	}
}
