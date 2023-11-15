import {
	BLACK,
	BLUE,
	CYAN,
	GREY,
	RED,
	SILVER,
	Splash,
	WHITE,
	equals,
	subtract,
} from "../../../../libraries/habitat-import.js"
import { GREY_SILVER, MIDDLE_C, shared } from "../../../main.js"
import { createCell, fireCell, getCell, modifyCell, t } from "../../../nogan/nogan.js"
import { Tunnel } from "../../components/tunnel.js"
import { Dom } from "../../components/dom.js"
import { Entity } from "../entity.js"
import { Ellipse } from "../shapes/ellipse.js"
import { Carry } from "../../components/carry.js"
import { Input } from "../../components/input.js"
import { setCellStyles } from "./shared.js"
import { FIFTH, FULL, HALF, QUARTER, SIXTH, THIRD } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { EllipseHtml } from "../shapes/ellipse-html.js"
import { Rectangle } from "../shapes/rectangle.js"
import { ArrowOfNoise } from "./noise.js"

export class ArrowOfRecording extends Entity {
	static recordingArrows = new Set()

	recorder = new Tone.Recorder()
	microphone = new Tone.UserMedia().connect(this.recorder)
	players = new Set()

	/** @type {Signal<"idle" | "recording" | "sound">} */
	recordingState = this.use("idle")

	isRecording = this.use(() => this.recordingState.get() === "recording")

	/** @type {Signal<number | null>} */
	recordingStart = this.use(null)

	/** @type {Signal<boolean>} */
	recordingBusy = this.use(false)

	/** @type {Signal<number | null>} */
	recordingDuration = this.use(null)

	/** @type {Signal<Vector2D | null>} */
	startPosition = this.use(null)

	/** @type {Signal<number>} */
	pitch = this.use(0)

	/**
	 * @param {{
	 * 	id?: CellId
	 * 	position?: [number, number]
	 * }} options
	 */
	constructor({
		position = t([0, 0]),
		id = createCell(shared.nogan, { type: "recording", position }).id,
	} = {}) {
		super()

		triggerCounter()

		// Attach components
		this.input = this.attach(new Input(this))
		this.tunnel = this.attach(new Tunnel(id, { entity: this }))
		this.dom = this.attach(
			new Dom({
				id: "recording",
				type: "html",
				input: this.input,
				position,
				cullBounds: [(FULL * 2) / 3, (FULL * 2) / 3],
			}),
		)
		this.carry = this.attach(new Carry({ input: this.input, dom: this.dom }))

		// Render elements
		this.noise = this.attach(new ArrowOfNoise(this))
		this.back = this.attach(new EllipseHtml({ input: this.input }))
		this.front = this.attach(new Ellipse())

		this.dom.append(this.noise.dom)
		this.dom.append(this.back.dom)
		this.dom.append(this.front.dom)

		// Style elements
		this.use(() => {
			// Gets bigger when at lower pitch
			const scale = -this.pitch.get() / 1000
			const clampedScale = Math.max(-10 / 11 / 2, Math.min(10 / 11 / 2, scale))
			this.back.dom.transform.scale.set([1, 1])
			this.front.dom.transform.scale.set([1 / 2 + clampedScale, 1 / 2 + clampedScale])
		}, [this.pitch])

		setCellStyles({
			back: this.back.dom,
			front: this.front.dom,
			input: this.input,
			tunnel: this.tunnel,
			frontOverride: () => {
				if (this.recordingState.get() === "recording") return RED
			},
		})

		// Nogan behaviour
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		this.tunnel.onFire = this.onFire.bind(this)

		// Tone.js
		this.microphone.open()
		this.handleRecordingTick = this.onRecordingTick.bind(this)

		// Pitch
		this.use(() => {
			if (this.startPosition.get() === null) return
			const displacement = subtract(this.startPosition.get(), this.dom.transform.position.get())
			const [dx, dy] = displacement

			this.pitch.set(dy / 2)

			for (const player of this.players) {
				// player.detune = this.pitch.get()
				player.playbackRate = 1 + this.pitch.get() / 1000
			}
		}, [this.dom.transform.position, this.carry.movement.velocity, this.startPosition])

		this.use(() => {
			if (this.isRecording.get()) {
				ArrowOfRecording.recordingArrows.add(this)
			} else {
				ArrowOfRecording.recordingArrows.delete(this)
			}
		}, [this.isRecording])

		// Asjustment to noise arrow
		this.noiseTime = this.use(() => {
			const [x] = this.noise.dom.transform.position.get()
			const diff = -(-FIFTH * 2 - x)
			return diff / FULL
		})
	}

	onClick() {
		this.onClickAsync()
	}

	onRecordingTick() {
		const recordingStart = this.recordingStart.get()
		if (!recordingStart) {
			throw new Error("Can't update recording duration without a start time")
		}

		this.recordingDuration.set(Tone.now() - recordingStart)
	}

	async onClickAsync() {
		if (this.recordingBusy.get()) return
		switch (this.recordingState.get()) {
			case "idle": {
				this.recordingBusy.set(true)
				Tunnel.schedule(() => {
					this.recordingBusy.set(false)
					return fireCell(shared.nogan, { id: this.tunnel.id })
				})
				return
			}
			case "recording": {
				this.recordingBusy.set(false)
				Tunnel.schedule(() => {
					this.recordingBusy.set(false)
					this.fromClick = true
					return fireCell(shared.nogan, { id: this.tunnel.id })
				})
				return
			}
			case "sound": {
				Tunnel.schedule(() => {
					return fireCell(shared.nogan, { id: this.tunnel.id })
				})
				return
			}
		}
	}

	fromClick = false

	async onFire() {
		if (this.recordingBusy.get()) return
		switch (this.recordingState.get()) {
			case "idle": {
				this.recordingState.set("recording")
				if (shared.scene.focusMode.get()) {
					Tone.Master.mute = true
				}
				this.recorder.start()
				this.recordingStart.set(Tone.now())
				this.listen("tick", this.handleRecordingTick)
				return
			}
			case "recording": {
				this.recordingBusy.set(true)
				const recordingStart = this.recordingStart.get()
				if (!recordingStart) {
					throw new Error("Tried to stop a recording that doesn't have a start time")
				}

				this.recordingDuration.set(Tone.now() - recordingStart)
				this.unlisten("tick", this.handleRecordingTick)
				this.startPosition.set(this.dom.transform.position.get())

				const recording = await this.recorder.stop()
				if (ArrowOfRecording.recordingArrows.size <= 1) {
					Tone.Master.mute = false
				}
				this.recordingState.set("sound")
				this.recordingBusy.set(false)
				this.url = URL.createObjectURL(recording)
				if (!this.fromClick) {
					this.onFire()
				}
				return
			}
			case "sound": {
				if (!this.url) {
					throw new Error("Tried to play a recording that doesn't have a url")
				}
				const player = await createPlayer(this.url, this.pitch.get())
				player.toDestination()
				player.playbackRate = 1 + this.pitch.get() / 1000
				const diff = Tone.now() + this.noiseTime.get()
				const isBefore = diff < Tone.now()
				const startTime = isBefore ? Tone.now() : diff
				const offset = isBefore ? Tone.now() - diff : 0
				player.start(startTime, offset)
				this.players.add(player)
				player.onended = () => {
					this.players.delete(player)
					player.dispose()
				}
				return
			}
		}
	}

	dispose() {
		for (const player of this.players) {
			player.dispose()
		}
		ArrowOfRecording.recordingArrows.delete(this)
		if (ArrowOfRecording.recordingArrows.size <= 1) {
			Tone.Master.mute = false
		}
		this.recorder.dispose()
		this.microphone.dispose()
		super.dispose()
	}
}

/**
 *
 * @param {string} url
 * @param {number} pitch
 * @returns
 */
async function createPlayer(url, pitch) {
	return new Promise((resolve) => {
		const player = new Tone.Player({
			url,
			onload: () => resolve(player),
		})
	})
}
