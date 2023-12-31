import { shared } from "../../main.js"
import { ArrowOfRecording } from "../entities/arrows/recording.js"

export function registerImporters() {
	addEventListener("paste", async (event) => {
		const items = event.clipboardData?.items ?? []
		for (let i = 0; i < items.length; i++) {
			dealWithPasteItem(items[i])
		}
	})
}

/**
 * @param {DataTransferItem} item
 */
async function dealWithPasteItem(item) {
	console.log(item.kind, item.type)
	switch (item.kind) {
		case "string": {
			// TODO: Paste text
			break
		}
		case "file": {
			const file = item.getAsFile()
			if (!file) return

			const blob = await file.arrayBuffer()

			const url = URL.createObjectURL(new Blob([blob], { type: file.type }))

			const audio = new Audio(url)
			const duration = await new Promise((resolve) => {
				audio.addEventListener("loadedmetadata", () => resolve(audio.duration), { once: true })
			})
			const recordingKey = ArrowOfRecording.recordings.add({
				url,
				duration,
			})

			const position = shared.scene.bounds.get().center
			const arrowOfRecording = new ArrowOfRecording({
				recordingKey,
				position,
			})

			shared.scene.dom.append(arrowOfRecording.dom)

			break
		}
	}
}
