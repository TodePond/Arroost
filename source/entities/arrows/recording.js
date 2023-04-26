import { GREY, SILVER, WHITE, glue, repeatArray } from "../../../libraries/habitat-import.js"
import { shared } from "../../main.js"
import { INNER_RATIO } from "../../unit.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Thing } from "../thing.js"
import { Carryable } from "./carryable.js"
import { ArrowOfNoise } from "./noise.js"

export const ArrowOfRecording = class extends Carryable {
	recording = this.use(false)
	playing = this.use(false)

	recordingStartTime = this.use(null)

	inner = new Ellipse()
	noiseHolder = new Thing()
	noise = this.use(null, { store: false })

	colour = this.use(
		() => {
			if (this.input.Pointing) return WHITE
			if (this.recording === true) {
				//return RED
			}
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
		} else if (this.recording) {
			this.onRecordStop()
		} else if (this.playing) {
			this.onPlayStop()
		} else {
			this.onPlayStart()
		}
	}

	tick() {
		super.tick()
		if (this.recording) {
			const difference = this.noise.duration - this.noise.trimEnd
			this.noise.duration = shared.time - this.recordingStartTime
			this.noise.trimEnd = this.noise.duration - difference
		}
	}

	onRecordStart() {
		this.recording = true
		this.noise = new ArrowOfNoise()
		this.noiseHolder.add(this.noise)
		this.noise.sendToBack()
		//this.noise.transform.position.x = INNER_UNIT / 3
		this.recordingStartTime = shared.time

		this.mediaRecorder = shared.audio.startRecording((blob, url) => {
			print(blob, url)
		})
	}

	async onRecordStop() {
		this.recording = false
		this.mediaRecorder.stop()
	}

	onPlayStart() {
		this.playing = true
		print(this.chunks)
	}

	onPlayStop() {
		this.playing = false
	}
}
