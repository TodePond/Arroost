export const TrimProcessor = class extends AudioWorkletProcessor {
	process(inputs, outputs, parameters) {
		const [input] = inputs
		const [output] = outputs
		const [trimStart] = parameters.trimStart

		for (let i = 0; i < input.length; i++) {
			const inputChannel = input[i]
			const outputChannel = output[i]

			const trimStartIndex = Math.floor(trimStart * inputChannel.length)

			for (let i = 0; i < inputChannel.length; i++) {
				if (i < trimStartIndex) continue
				outputChannel[i] = inputChannel[i]
			}
		}
		return true
	}

	static get parameterDescriptors() {
		return [
			{
				name: "trimStart",
				defaultValue: 0,
				minValue: 0,
				maxValue: 1,
			},
			{
				name: "trimEnd",
				defaultValue: 1,
				minValue: 0,
				maxValue: 1,
			},
		]
	}
}

registerProcessor("trim", TrimProcessor)
