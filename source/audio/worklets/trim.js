export const TrimProcessor = class extends AudioWorkletProcessor {
	process(inputs, outputs, parameters) {
		const [input] = inputs
		const [output] = outputs
		const [trimStart] = parameters.trimStart
		const [trimEnd] = parameters.trimEnd
		const [playStart] = parameters.playStart

		for (let i = 0; i < input.length; i++) {
			const inputChannel = input[i]
			const outputChannel = output[i]

			const time = currentTime - playStart
			for (let i = 0; i < inputChannel.length; i++) {
				if (time < trimStart || time > trimEnd) {
					outputChannel[i] = 0
				} else {
					outputChannel[i] = inputChannel[i]
				}
			}
		}
		return true
	}

	static get parameterDescriptors() {
		return [
			{
				name: "trimStart",
			},
			{
				name: "trimEnd",
			},
			{
				name: "playStart",
			},
		]
	}
}

registerProcessor("trim", TrimProcessor)
