import { memo } from "../../libraries/habitat-import.js"

export const getAudioContext = memo(() => new AudioContext())
export const getAudioWorklets = memo(async () => {
	const context = getAudioContext()
	//await context.audioWorklet.addModule("source/audio/worklets/trim.js")
})

export const getInputStream = memo(
	async () =>
		await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: false,
				noiseSuppression: false,
				autoGainControl: false,
			},
		}),
)

// Warm it up!
getInputStream()

export const getInputSource = async () => {
	const context = getAudioContext()
	const stream = await getInputStream()
	return context.createMediaStreamSource(stream)
}

export const record = async () => {
	const context = getAudioContext()
	const source = await getInputSource()
	const destination = context.createMediaStreamDestination()
	const recorder = new MediaRecorder(destination.stream)
	source.connect(destination)
	recorder.start()
	return async () => {
		recorder.stop()
		return await new Promise((resolve) => {
			recorder.ondataavailable = async ({ data }) => {
				source.disconnect(destination)
				const arrayBuffer = await data.arrayBuffer()
				const audioBuffer = await context.decodeAudioData(arrayBuffer)
				resolve(audioBuffer)
			}
		})
	}
}

export const makeBufferSource = (buffer) => {
	const context = getAudioContext()
	const source = context.createBufferSource()
	source.buffer = buffer
	return source
}

export const getWorklet = async (name) => {
	const context = getAudioContext()
	await getAudioWorklets()
	return new AudioWorkletNode(context, name)
}
