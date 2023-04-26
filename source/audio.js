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

	constructor() {
		this.init()
	}

	async init() {
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })

		this.ready = true
	}

	startRecording(onStop) {
		const mediaRecorder = new MediaRecorder(this.stream)
		const chunks = []
		mediaRecorder.ondataavailable = (event) => {
			chunks.push(event.data)
		}
		mediaRecorder.onstop = () => {
			const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
			const url = window.URL.createObjectURL(blob)
			onStop(blob, url)
		}
		mediaRecorder.start()
		return mediaRecorder
	}

	stopRecording(mediaRecorder) {
		mediaRecorder.stop()
	}
}
