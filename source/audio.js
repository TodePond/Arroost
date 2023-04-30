import { range } from "../libraries/habitat-import.js"
import { shared } from "./main.js"

let cachedAudio = undefined
export const getAudio = async () => {
	if (cachedAudio !== undefined) {
		return cachedAudio
	}

	const audio = new Audio()
	await audio.init()
	cachedAudio = audio
	return audio
}

// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API

const Audio = class {
	ready = false

	audios = [...range(0, 99)].map(() => document.createElement("audio"))
	currentAudioId = 0

	constructor() {
		this.init()
	}

	async init() {
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
		this.ready = true
	}

	play(recording) {
		const audio = this.audios[this.currentAudioId]
		audio.src = recording.url
		audio.play()
		this.currentAudioId = (this.currentAudioId + 1) % this.audios.length
	}
}

export const Recorder = class {
	constructor() {
		this.mediaRecorder = new MediaRecorder(shared.audio.stream)
		this.chunks = []
		this.mediaRecorder.ondataavailable = (event) => {
			this.chunks.push(event.data)
		}
		this.mediaRecorder.onstop = () => {
			this.blob = new Blob(this.chunks, { type: "audio/ogg; codecs=opus" })
			this.url = window.URL.createObjectURL(this.blob)
			this.onStop()
		}
		this.audio = document.createElement("audio")
	}

	start() {
		this.recording = true
		this.mediaRecorder.start()
	}

	stop() {
		this.recording = false
		this.mediaRecorder.stop()
	}

	onStop() {}
}
