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
import { FULL, HALF, QUARTER, SIXTH, THIRD } from "../../unit.js"
import { triggerCounter } from "../counter.js"
import { EllipseHtml } from "../shapes/ellipse-html.js"
import { Rectangle } from "../shapes/rectangle.js"
import { ArrowOfNoise } from "./noise.js"

export class ArrowOfRecording extends Entity {
	recorder = new Tone.Recorder()
	microphone = new Tone.UserMedia().connect(this.recorder)
	hasSound = this.use(false)
	isRecording = this.use(false)
	players = new Set()

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
		}, [this.hasSound, this.pitch])

		this.use(() => {
			const hasSound = this.hasSound.get()
			const isRecording = this.isRecording.get()
			this.front.dom.style.visibility.set(hasSound || isRecording ? "visible" : "hidden")
		}, [this.hasSound, this.isRecording])

		setCellStyles({
			back: this.back.dom,
			front: this.front.dom,
			input: this.input,
			tunnel: this.tunnel,
			frontOverride: () => this.isRecording.get() && RED,
			// backOverride: () => this.isRecording.get() && GREY_SILVER,
		})

		// Nogan behaviour
		const pointing = this.input.state("pointing")
		pointing.pointerup = this.onClick.bind(this)
		this.tunnel.onFire = this.onFire.bind(this)

		// Tone.js
		this.microphone.open()

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
	}

	onClick() {
		this.onClickAsync()
		// Tunnel.perform(() => {
		// 	return fireCell(shared.nogan, { id: this.tunnel.id })
		// })
	}

	/** @type {Signal<Vector2D | null>} */
	startPosition = this.use(null)

	/** @type {Signal<number>} */
	pitch = this.use(0)

	async onClickAsync() {
		if (!this.hasSound.get()) {
			if (this.isRecording.get()) {
				const recording = await this.recorder.stop()
				const url = URL.createObjectURL(recording)
				this.url = url

				this.isRecording.set(false)
				this.hasSound.set(true)
				this.startPosition.set(this.dom.transform.position.get())
			} else {
				this.recorder.start()
				this.isRecording.set(true)
			}
		} else {
			Tunnel.perform(() => {
				return fireCell(shared.nogan, { id: this.tunnel.id })
			})
		}
	}

	async onFire() {
		if (!this.hasSound.get()) return

		const player = await new Tone.Player(this.url).toDestination()
		player.playbackRate = 1 + this.pitch.get() / 1000
		player.autostart = true
		this.players.add(player)
		player.onended = () => {
			this.players.delete(player)
			player.dispose()
		}

		// const pitchChange = this.pitch.get()
		// const pitch = MIDDLE_C + pitchChange
		// if (!Number.isFinite(pitch)) return
		// if (pitch < -Number.MAX_SAFE_INTEGER || pitch > Number.MAX_SAFE_INTEGER) return
		// this.sampler.triggerAttackRelease("C4")
	}

	dispose() {
		for (const player of this.players) {
			player.dispose()
		}
		this.recorder.dispose()
		this.microphone.dispose()
		super.dispose()
	}
}
