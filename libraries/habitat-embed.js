//=============//
// FROGASAURUS //
//=============//
const HabitatFrogasaurus = {}

//========//
// SOURCE //
//========//
{
	//====== ./habitat.js ======
	{
		HabitatFrogasaurus["./habitat.js"] = {}

		const registerMethods = () => {
			registerDebugMethods()
			registerColourMethods()
			registerVectorMethods()
		}

		const registerGlobals = () => {
			Object.assign(window, Habitat)
		}

		const registerEverything = () => {
			registerGlobals()
			registerMethods()
		}

		HabitatFrogasaurus["./habitat.js"].registerMethods = registerMethods
		HabitatFrogasaurus["./habitat.js"].registerGlobals = registerGlobals
		HabitatFrogasaurus["./habitat.js"].registerEverything = registerEverything
	}

	//====== ./html.js ======
	{
		HabitatFrogasaurus["./html.js"] = {}
		const HTML = (source) => {
			const template = document.createElement("template")
			template.innerHTML = source
			const { content } = template
			if (content.childElementCount === 1) {
				return content.firstChild
			}
			return template.content
		}

		HabitatFrogasaurus["./html.js"].HTML = HTML
	}

	//====== ./number.js ======
	{
		HabitatFrogasaurus["./number.js"] = {}
		const clamp = (number, min, max) => {
			if (number < min) return min
			if (number > max) return max
			return number
		}

		const wrap = (number, min, max) => {
			const range = max - min + 1
			while (number < min) number += range
			while (number > max) number -= range
			return number
		}

		const getDigits = (number) => {
			const chars = number.toString().split("")
			const digits = chars.map((v) => parseInt(v)).filter((v) => !isNaN(v))
			return digits
		}

		const gcd = (...numbers) => {
			const [head, ...tail] = numbers
			if (numbers.length === 1) return head
			if (numbers.length > 2) return gcd(head, gcd(...tail))

			let [a, b] = [head, ...tail]
			while (true) {
				if (b === 0) return a
				a = a % b
				if (a === 0) return b
				b = b % a
			}
		}

		const simplifyRatio = (...numbers) => {
			const divisor = gcd(...numbers)
			return numbers.map((n) => n / divisor)
		}

		const range = function* (start, end) {
			let i = start
			if (i <= end)
				do {
					yield i
					i++
				} while (i <= end)
			else
				while (i >= end) {
					yield i
					i--
				}
		}

		HabitatFrogasaurus["./number.js"].clamp = clamp
		HabitatFrogasaurus["./number.js"].wrap = wrap
		HabitatFrogasaurus["./number.js"].getDigits = getDigits
		HabitatFrogasaurus["./number.js"].gcd = gcd
		HabitatFrogasaurus["./number.js"].simplifyRatio = simplifyRatio
		HabitatFrogasaurus["./number.js"].range = range
	}

	//====== ./memo.js ======
	{
		HabitatFrogasaurus["./memo.js"] = {}
		const memo = (func, getKey = JSON.stringify) => {
			const cache = new Map()
			return (...args) => {
				const key = getKey(args)
				if (cache.has(key)) {
					return cache.get(key)
				}

				const result = func(...args)
				cache.set(key, result)
				return result
			}
		}

		HabitatFrogasaurus["./memo.js"].memo = memo
	}

	//====== ./random.js ======
	{
		HabitatFrogasaurus["./random.js"] = {}
		const maxRandomNumberIndex = 2 ** 14
		const randomNumbersBuffer = new Uint32Array(maxRandomNumberIndex)
		let randomNumberIndex = Infinity

		const random = () => {
			if (randomNumberIndex >= maxRandomNumberIndex) {
				crypto.getRandomValues(randomNumbersBuffer)
				randomNumberIndex = 0
			}
			const result = randomNumbersBuffer[randomNumberIndex]
			randomNumberIndex++
			return result
		}

		const randomFrom = (array) => {
			const index = random() % array.length
			return array[index]
		}

		const oneIn = (times) => random() % times < 1
		const maybe = (chance) => oneIn(1 / chance)

		HabitatFrogasaurus["./random.js"].random = random
		HabitatFrogasaurus["./random.js"].randomFrom = randomFrom
		HabitatFrogasaurus["./random.js"].oneIn = oneIn
		HabitatFrogasaurus["./random.js"].maybe = maybe
	}

	//====== ./event.js ======
	{
		HabitatFrogasaurus["./event.js"] = {}
		const fireEvent = (name, options = {}) => {
			const { target = window, bubbles = true, cancelable = true, ...data } = options
			const event = new Event(name, { bubbles, cancelable })
			for (const key in data) {
				event[key] = data[key]
			}
			target.dispatchEvent(event)
		}

		const on = (event, func, options) => {
			return addEventListener(event, func, options)
		}

		HabitatFrogasaurus["./event.js"].fireEvent = fireEvent
		HabitatFrogasaurus["./event.js"].on = on
	}

	//====== ./console.js ======
	{
		HabitatFrogasaurus["./console.js"] = {}

		const print = console.log.bind(console)

		let printCount = 0
		const print9 = (message) => {
			if (printCount > 9) return
			printCount++
			print(message)
		}

		const registerDebugMethods = () => {
			defineGetter(Object.prototype, "d", function () {
				const value = this.valueOf()
				print(value)
				return value
			})

			defineGetter(Object.prototype, "d9", function () {
				const value = this.valueOf()
				print9(value)
				return value
			})
		}

		HabitatFrogasaurus["./console.js"].print = print
		HabitatFrogasaurus["./console.js"].print9 = print9
		HabitatFrogasaurus["./console.js"].registerDebugMethods = registerDebugMethods
	}

	//====== ./property.js ======
	{
		HabitatFrogasaurus["./property.js"] = {}
		const defineGetter = (object, name, get) => {
			return Reflect.defineProperty(object, name, {
				get,
				set(value) {
					Reflect.defineProperty(this, name, {
						value,
						configurable: true,
						writable: true,
						enumerable: true,
					})
				},
				configurable: true,
				enumerable: false,
			})
		}

		const defineAccessor = (object, name, get, set) => {
			return Reflect.defineProperty(object, name, {
				get,
				set,
				configurable: true,
				enumerable: false,
			})
		}

		HabitatFrogasaurus["./property.js"].defineGetter = defineGetter
		HabitatFrogasaurus["./property.js"].defineAccessor = defineAccessor
	}

	//====== ./linked-list.js ======
	{
		HabitatFrogasaurus["./linked-list.js"] = {}
		const LinkedList = class {
			constructor(iterable = []) {
				this.start = undefined
				this.end = undefined
				this.isEmpty = true

				for (const value of iterable) {
					this.push(value)
				}
			}

			*[Symbol.iterator]() {
				let link = this.start
				while (link !== undefined) {
					yield link.value
					link = link.next
				}
			}

			toString() {
				return [...this].toString()
			}

			push(...values) {
				for (const value of values) {
					const link = makeLink(value)
					if (this.isEmpty) {
						this.start = link
						this.end = link
						this.isEmpty = false
					} else {
						this.end.next = link
						link.previous = this.end
						this.end = link
					}
				}
			}

			pop() {
				if (this.isEmpty) {
					return undefined
				}

				const value = this.start.value
				if (this.start === this.end) {
					this.clear()
					return value
				}

				this.end = this.end.previous
				this.end.next = undefined
				return value
			}

			shift() {
				if (this.isEmpty) {
					return undefined
				}

				const value = this.start.value
				if (this.start === this.end) {
					this.clear()
					return value
				}

				this.start = this.start.next
				this.start.previous = undefined
				return value
			}

			clear() {
				this.start = undefined
				this.end = undefined
				this.isEmpty = true
			}

			setStart(link) {
				this.start = link
				link.previous = undefined
			}
		}

		const makeLink = (value) => {
			const previous = undefined
			const next = undefined
			const link = { value, previous, next }
			return link
		}

		HabitatFrogasaurus["./linked-list.js"].LinkedList = LinkedList
	}

	//====== ./vector.js ======
	{
		HabitatFrogasaurus["./vector.js"] = {}

		const scale = (value, scale) => {
			if (typeof value === "number") return value * scale
			return value.map((v) => v * scale)
		}

		const add = (a, b) => {
			if (typeof a === "number") {
				return a + b
			}

			if (a.length === 2) {
				const [ax, ay] = a
				const [bx, by] = b
				const x = ax + bx
				const y = ay + by
				return [x, y]
			} else {
				const [ax, ay, az] = a
				const [bx, by, bz] = b
				const x = ax + bx
				const y = ay + by
				const z = az + bz
				return [x, y, z]
			}
		}

		const subtract = (a, b) => {
			if (typeof a === "number") {
				return a - b
			}

			if (a.length === 2) {
				const [ax, ay] = a
				const [bx, by] = b
				const x = ax - bx
				const y = ay - by
				return [x, y]
			} else {
				const [ax, ay, az] = a
				const [bx, by, bz] = b
				const x = ax - bx
				const y = ay - by
				const z = az - bz
				return [x, y, z]
			}
		}

		const crossProduct = (a, b) => {
			if (a.length === 2) {
				const [ax, ay] = a
				const [bx, by] = b
				return ax * by - ay * bx
			} else {
				const [ax, ay, az] = a
				const [bx, by, bz] = b
				return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]
			}
		}

		const distanceBetween = (a, b) => {
			if (typeof a === "number") {
				return Math.abs(a - b)
			}

			const displacement = subtractVector(a, b)
			const [dx, dy, dz = 0] = displacement
			const distance = Math.hypot(dx, dy, dz)
			return distance
		}

		const angleBetween = (a, b) => {
			if (a.length !== 2) {
				throw new Error(
					"[Habitat] Sorry, only 2D vectors are supported at the moment. Please bug @todepond to support other lengths :)",
				)
			}
			const displacement = subtractVector(a, b)
			const [dx, dy] = displacement
			const angle = Math.atan2(dy, dx)
			return angle
		}

		const registerVectorMethods = () => {
			defineAccessor(
				Array.prototype,
				"x",
				function () {
					return this[0]
				},
				function (value) {
					this[0] = value
				},
			)

			defineAccessor(
				Array.prototype,
				"y",
				function () {
					return this[1]
				},
				function (value) {
					this[1] = value
				},
			)

			defineAccessor(
				Array.prototype,
				"z",
				function () {
					return this[2]
				},
				function (value) {
					this[2] = value
				},
			)
		}

		HabitatFrogasaurus["./vector.js"].scale = scale
		HabitatFrogasaurus["./vector.js"].add = add
		HabitatFrogasaurus["./vector.js"].subtract = subtract
		HabitatFrogasaurus["./vector.js"].crossProduct = crossProduct
		HabitatFrogasaurus["./vector.js"].distanceBetween = distanceBetween
		HabitatFrogasaurus["./vector.js"].angleBetween = angleBetween
		HabitatFrogasaurus["./vector.js"].registerVectorMethods = registerVectorMethods
	}

	//====== ./lerp.js ======
	{
		HabitatFrogasaurus["./lerp.js"] = {}

		const lerp = ([a, b], distance) => {
			const range = subtract(b, a)
			const displacement = scale(range, distance)
			return add(a, displacement)
		}

		const bilerp = ([a, b, c, d], displacement) => {
			const [dx, dy] = displacement
			const la = lerp([a, b], dx)
			const lb = lerp([d, c], dx)

			const line = [la, lb]
			return lerp(line, dy)
		}

		// based on https://iquilezles.org/articles/ibilinear
		// adapted by Magnogen https://magnogen.net
		const ibilerp = ([a, b, c, d], value) => {
			if (typeof value === "number") {
				throw new Error(
					`[Habitat] Sorry, 'ibilerp' doesn't support numbers yet - only vectors... Please contact @todepond :)`,
				)
			}

			const e = subtract(b, a)
			const f = subtract(d, a)
			const g = add(subtract(a, b), subtract(c, d))
			const h = subtract(value, a)

			const k2 = crossProduct(g, f)
			const k1 = crossProduct(e, f) + crossProduct(h, g)
			const k0 = crossProduct(h, e)

			if (Math.abs(k2) < 0.0001) {
				const x = (h[0] * k1 + f[0] * k0) / (e[0] * k1 - g[0] * k0)
				const y = -k0 / k1
				return [x, y]
			}

			let w = k1 * k1 - 4 * k0 * k2
			w = Math.sqrt(w)

			const ik2 = 0.5 / k2
			let v = (-k1 - w) * ik2
			let u = (h[0] - f[0] * v) / (e[0] + g[0] * v)

			if (u < 0.0 || u > 1.0 || v < 0.0 || v > 1.0) {
				v = (-k1 + w) * ik2
				u = (h[0] - f[0] * v) / (e[0] + g[0] * v)
			}

			return [u, v]
		}

		HabitatFrogasaurus["./lerp.js"].lerp = lerp
		HabitatFrogasaurus["./lerp.js"].bilerp = bilerp
		HabitatFrogasaurus["./lerp.js"].ibilerp = ibilerp
	}

	//====== ./array.js ======
	{
		HabitatFrogasaurus["./array.js"] = {}
		const shuffleArray = (array) => {
			// Go backwards through the array
			for (let i = array.length - 1; i > 0; i--) {
				// Swap each value with a random value before it (which might include itself)
				const j = Math.floor(Math.random() * (i + 1))
				;[array[i], array[j]] = [array[j], array[i]]
			}
			return array
		}

		const trimArray = (array) => {
			// If the array is empty just return it
			if (array.length == 0) return array

			let start = array.length - 1
			let end = 0

			// Find the first non-undefined index
			for (let i = 0; i < array.length; i++) {
				const value = array[i]
				if (value !== undefined) {
					start = i
					break
				}
			}

			// Find the last non-undefined index
			for (let i = array.length - 1; i >= 0; i--) {
				const value = array[i]
				if (value !== undefined) {
					end = i + 1
					break
				}
			}

			// Cut off the start and end of the array
			array.splice(end)
			array.splice(0, start)
			return array
		}

		const repeatArray = (array, count) => {
			// If count is zero, empty the array
			if (count === 0) {
				array.splice(0)
				return array
			}

			// If count is less than zero, reverse the array
			else if (count < 0) {
				array.reverse()
				count = Math.abs(count)
			}

			// Otherwise repeat the array
			const clone = [...array]
			for (let i = 0; i < count - 1; i++) {
				array.push(...clone)
			}

			return array
		}

		HabitatFrogasaurus["./array.js"].shuffleArray = shuffleArray
		HabitatFrogasaurus["./array.js"].trimArray = trimArray
		HabitatFrogasaurus["./array.js"].repeatArray = repeatArray
	}

	//====== ./javascript.js ======
	{
		HabitatFrogasaurus["./javascript.js"] = {}
		const JavaScript = (source) => {
			const code = `return ${source}`
			const value = new Function(code)()
			return value
		}

		HabitatFrogasaurus["./javascript.js"].JavaScript = JavaScript
	}

	//====== ./string.js ======
	{
		HabitatFrogasaurus["./string.js"] = {}
		const divideString = (string, length) => {
			const regExp = RegExp(`[^]{1,${length}}`, "g")
			return string.match(regExp)
		}

		HabitatFrogasaurus["./string.js"].divideString = divideString
	}

	//====== ./stage.js ======
	{
		HabitatFrogasaurus["./stage.js"] = {}

		const Stage = function (properties) {
			const template = struct({
				context: undefined,
				scale: 1.0,
				aspectRatio: undefined,

				speed: 1.0,
				clock: 0.0,
				paused: false,

				start: () => {},
				resize: () => {},
				tick: () => {},
				update: () => {},
			})

			const stage = template(properties)

			if (document.body === null) {
				addEventListener("load", () => {
					requestAnimationFrame(() => start(stage))
				})
			} else {
				requestAnimationFrame(() => start(stage))
			}

			return stage
		}

		const start = (stage) => {
			// Create a context + canvas if no context was provided
			if (stage.context === undefined) {
				const canvas = document.createElement("canvas")
				canvas.style["background-color"] = "#171d28"
				canvas.style["image-rendering"] = "pixelated"
				document.body.style["background-color"] = "#06070a"
				document.body.style["margin"] = "0px"
				document.body.style["overflow"] = "hidden"
				document.body.appendChild(canvas)
				stage.context = canvas.getContext("2d")
			}

			on("resize", () => resize(stage))
			on(keyDown(" "), () => (stage.paused = !stage.paused))

			stage.start(stage.context)
			resize(stage)
			tick(stage)
		}

		const resize = (stage) => {
			let width = innerWidth
			let height = innerHeight

			if (stage.aspectRatio !== undefined) {
				const [x, y] = stage.aspectRatio
				height = (innerWidth * y) / x
				const heightGrowth = height / innerHeight
				if (heightGrowth > 1.0) {
					height /= heightGrowth
					width /= heightGrowth
				}
			}

			const scaledWidth = width * stage.scale
			const scaledHeight = height * stage.scale

			const { canvas } = stage.context
			canvas.width = Math.round(scaledWidth)
			canvas.height = Math.round(scaledHeight)
			canvas.style["width"] = canvas.width
			canvas.style["height"] = canvas.height

			const marginHorizontal = (innerWidth - scaledWidth) / 2
			const marginVertical = (innerHeight - scaledHeight) / 2
			canvas.style["margin-left"] = marginHorizontal
			canvas.style["margin-right"] = marginHorizontal
			canvas.style["margin-top"] = marginVertical
			canvas.style["margin-bottom"] = marginVertical
			stage.resize(stage.context)
		}
		const tick = (stage) => {
			stage.clock += stage.speed
			while (stage.clock > 0) {
				if (!stage.paused) stage.update(stage.context)
				stage.tick(stage.context, stage)
				stage.clock--
			}

			requestAnimationFrame(() => tick(stage))
		}

		HabitatFrogasaurus["./stage.js"].Stage = Stage
	}

	//====== ./async.js ======
	{
		HabitatFrogasaurus["./async.js"] = {}
		const sleep = (duration) => {
			new Promise((resolve) => setTimeout(resolve, duration))
		}

		HabitatFrogasaurus["./async.js"].sleep = sleep
	}

	//====== ./pointer.js ======
	{
		HabitatFrogasaurus["./pointer.js"] = {}
		let isPointerTracked = false
		const pointer = {
			position: [undefined, undefined],
			down: undefined,
		}

		const getPointer = () => {
			if (isPointerTracked) return pointer
			isPointerTracked = true

			addEventListener("pointermove", (e) => {
				pointer.position[0] = e.clientX
				pointer.position[1] = e.clientY
			})

			addEventListener("pointerdown", (e) => {
				pointer.position[0] = e.clientX
				pointer.position[1] = e.clientY
				pointer.down = true
			})

			addEventListener("pointerup", (e) => {
				pointer.position[0] = e.clientX
				pointer.position[1] = e.clientY
				pointer.down = false
			})

			return pointer
		}

		HabitatFrogasaurus["./pointer.js"].getPointer = getPointer
	}

	//====== ./keyboard.js ======
	{
		HabitatFrogasaurus["./keyboard.js"] = {}

		const keyboard = {}
		let isKeyboardTracked = false
		const getKeyboard = () => {
			if (isKeyboardTracked) return keyboard
			isKeyboardTracked = true
			on("keydown", (e) => {
				keyboard[e.key] = true
			})

			on("keyup", (e) => {
				keyboard[e.key] = false
			})

			return keyboard
		}

		let isKeyDownTracked = false
		const keyDown = (key) => {
			if (!isKeyDownTracked) {
				isKeyDownTracked = true
				on("keydown", (e) => fireEvent(`keyDown("${e.key}")`), { passive: false })
			}
			return `keyDown("${key}")`
		}

		let isKeyUpTracked = false
		const keyUp = (key) => {
			if (!isKeyUpTracked) {
				isKeyUpTracked = true
				on("keyup", (e) => fireEvent(`keyUp("${e.key}")`), { passive: false })
			}
			return `keyUp("${key}")`
		}

		HabitatFrogasaurus["./keyboard.js"].getKeyboard = getKeyboard
		HabitatFrogasaurus["./keyboard.js"].keyDown = keyDown
		HabitatFrogasaurus["./keyboard.js"].keyUp = keyUp
	}

	//====== ./struct.js ======
	{
		HabitatFrogasaurus["./struct.js"] = {}
		const struct = (parameters) =>
			function (args) {
				return { ...parameters, ...args }
			}

		HabitatFrogasaurus["./struct.js"].struct = struct
	}

	//====== ./colour.js ======
	{
		HabitatFrogasaurus["./colour.js"] = {}

		//===========//
		// UTILITIES //
		//===========//
		const wrapSplashNumber = (number) => {
			while (number < 0) number += 1000
			while (number > 999) number -= 1000
			return number
		}

		const getThreeDigits = (number) => {
			const chars = number.toString().padStart(3, "0").split("")
			const digits = chars.map((v) => parseInt(v))
			return digits
		}

		//=========//
		// CLASSES //
		//=========//
		const Colour = class extends Array {
			constructor(red, green, blue, alpha = 255) {
				super()
				this.push(red, green, blue)
				if (alpha !== undefined) {
					this.push(alpha)
				}
			}

			toString() {
				const [red, green, blue, alpha] = this.map((v) => v.toString(16).padStart(2, "0"))
				if (this.alpha === 255) {
					return `#${red}${green}${blue}`
				}

				return `#${red}${green}${blue}${alpha}`
			}
		}

		const Splash = class extends Colour {
			constructor(number) {
				const wrappedNumber = wrapSplashNumber(number)
				const [hundreds, tens, ones] = getThreeDigits(wrappedNumber, 3)
				const red = RED_SPLASH_VALUES[hundreds]
				const green = GREEN_SPLASH_VALUES[tens]
				const blue = BLUE_SPLASH_VALUES[ones]
				super(red, green, blue)
			}
		}

		//===========//
		// FUNCTIONS //
		//===========//
		const showColour = (colour) => {
			console.log("%c   ", `background-color: ${new Colour(...colour)}`)
		}

		//=========//
		// METHODS //
		//=========//
		const registerColourMethods = () => {
			defineGetter(Array.prototype, "red", function () {
				return this[0]
			})

			defineGetter(Array.prototype, "green", function () {
				return this[1]
			})

			defineGetter(Array.prototype, "blue", function () {
				return this[2]
			})

			defineGetter(Array.prototype, "alpha", function () {
				return this[3]
			})
		}

		//===========//
		// CONSTANTS //
		//===========//
		const RED_SPLASH_VALUES = [23, 55, 70, 98, 128, 159, 174, 204, 242, 255]
		const GREEN_SPLASH_VALUES = [29, 67, 98, 128, 159, 174, 204, 222, 245, 255]
		const BLUE_SPLASH_VALUES = [40, 70, 98, 128, 159, 174, 204, 222, 247, 255]

		const VOID = new Colour(6, 7, 10)
		const BLACK = new Splash(0)
		const GREY = new Splash(112)
		const SILVER = new Splash(556)
		const WHITE = new Splash(999)

		const GREEN = new Splash(293)
		const CYAN = new Splash(269)
		const BLUE = new Splash(239)
		const PURPLE = new Splash(418)
		const PINK = new Splash(937)
		const CORAL = new Splash(933)
		const RED = new Splash(911)
		const ORANGE = new Splash(931)
		const YELLOW = new Splash(991)

		const HUES = [GREEN, CYAN, BLUE, PURPLE, PINK, CORAL, RED, ORANGE, YELLOW]

		const SHADES = [VOID, BLACK, GREY, SILVER, WHITE]

		const COLOURS = [...SHADES, ...HUES]

		HabitatFrogasaurus["./colour.js"].Colour = Colour
		HabitatFrogasaurus["./colour.js"].Splash = Splash
		HabitatFrogasaurus["./colour.js"].showColour = showColour
		HabitatFrogasaurus["./colour.js"].registerColourMethods = registerColourMethods
		HabitatFrogasaurus["./colour.js"].VOID = VOID
		HabitatFrogasaurus["./colour.js"].BLACK = BLACK
		HabitatFrogasaurus["./colour.js"].GREY = GREY
		HabitatFrogasaurus["./colour.js"].SILVER = SILVER
		HabitatFrogasaurus["./colour.js"].WHITE = WHITE
		HabitatFrogasaurus["./colour.js"].GREEN = GREEN
		HabitatFrogasaurus["./colour.js"].CYAN = CYAN
		HabitatFrogasaurus["./colour.js"].BLUE = BLUE
		HabitatFrogasaurus["./colour.js"].PURPLE = PURPLE
		HabitatFrogasaurus["./colour.js"].PINK = PINK
		HabitatFrogasaurus["./colour.js"].CORAL = CORAL
		HabitatFrogasaurus["./colour.js"].RED = RED
		HabitatFrogasaurus["./colour.js"].ORANGE = ORANGE
		HabitatFrogasaurus["./colour.js"].YELLOW = YELLOW
		HabitatFrogasaurus["./colour.js"].HUES = HUES
		HabitatFrogasaurus["./colour.js"].SHADES = SHADES
		HabitatFrogasaurus["./colour.js"].COLOURS = COLOURS
	}

	//====== ./json.js ======
	{
		HabitatFrogasaurus["./json.js"] = {}
		const _ = (value) => {
			return JSON.stringify(value)
		}

		HabitatFrogasaurus["./json.js"]._ = _
	}

	//====== ./mouse.js ======
	{
		HabitatFrogasaurus["./mouse.js"] = {}

		let isMouseTracked = false
		const buttonNames = ["Left", "Middle", "Right", "Back", "Forward"]
		const mouse = {
			position: [undefined, undefined],
		}

		const getMouse = () => {
			if (isMouseTracked) return mouse
			isMouseTracked = true

			on("mousemove", (e) => {
				mouse.position[0] = e.clientX
				mouse.position[1] = e.clientY
			})

			on("mousedown", (e) => {
				mouse.position[0] = e.clientX
				mouse.position[1] = e.clientY
				const buttonName = buttonNames[e.button]
				mouse[buttonName] = true
			})

			on("mouseup", (e) => {
				mouse.position[0] = e.clientX
				mouse.position[1] = e.clientY
				const buttonName = buttonNames[e.button]
				mouse[buttonName] = false
			})

			return mouse
		}

		let isMouseDownTracked = false
		const mouseDown = (buttonName) => {
			const button = buttonNames.indexOf(buttonName)
			if (!isMouseDownTracked) {
				isMouseDownTracked = true
				on("mousedown", (e) => fireEvent(`mouseDown("${e.button}")`), { passive: false })
			}
			return `mouseDown("${button}")`
		}

		let isMouseUpTracked = false
		const mouseUp = (buttonName) => {
			const button = buttonNames.indexOf(buttonName)
			if (!isMouseUpTracked) {
				isMouseUpTracked = true
				on("mouseup", (e) => fireEvent(`mouseUp("${e.button}")`), { passive: false })
			}
			return `mouseUp("${button}")`
		}

		HabitatFrogasaurus["./mouse.js"].getMouse = getMouse
		HabitatFrogasaurus["./mouse.js"].mouseDown = mouseDown
		HabitatFrogasaurus["./mouse.js"].mouseUp = mouseUp
	}

	//====== ./tween.js ======
	{
		HabitatFrogasaurus["./tween.js"] = {}

		const tween = (object, key, options) => {
			const value = object[key]

			const { start = value, end = value, duration = 1000, easeIn = 0.0, easeOut = 0.0, ratio = 0.5 } = options

			const startTime = performance.now()
			const endTime = startTime + duration

			defineGetter(object, key, () => {
				const currentTime = performance.now()

				if (currentTime >= endTime) {
					Reflect.defineProperty(object, key, {
						value: end,
						writable: true,
						configurable: true,
						enumerable: true,
					})
					return end
				}

				const time = currentTime - startTime
				const interpolation = ease(time / duration, {
					easeIn,
					easeOut,
					ratio: 1 - ratio,
				})
				return lerp([start, end], interpolation)
			})
		}

		const ease = (t, { easeIn, easeOut, ratio }) => {
			const f = (t, slope) => t ** (1.0 + slope)
			return f(t * ratio * 2, easeIn) / (f(t * ratio * 2, easeIn) + f((1 - t) * (1 - ratio) * 2, easeOut))
		}

		HabitatFrogasaurus["./tween.js"].tween = tween
	}

	//====== ./touch.js ======
	{
		HabitatFrogasaurus["./touch.js"] = {}

		const touches = []

		let isTouchTracked = false
		const getTouches = () => {
			if (!isTouchTracked) {
				isTouchTracked = true

				on("touchstart", (e) => {
					for (const changedTouch of e.changedTouches) {
						const id = changedTouch.identifier
						if (touches[id] === undefined) {
							touches[id] = { position: [undefined, undefined] }
						}

						const touch = touches[id]
						touch.position[0] = changedTouch.clientX
						touch.position[1] = changedTouch.clientY
					}
				})

				on("touchmove", (e) => {
					for (const changedTouch of e.changedTouches) {
						const id = changedTouch.identifier
						const touch = touches[id]
						touch.position[0] = changedTouch.clientX
						touch.position[1] = changedTouch.clientY
					}
				})

				on("touchend", (e) => {
					for (const changedTouch of e.changedTouches) {
						const id = changedTouch.identifier
						touches[id] = undefined
					}
				})
			}

			return touches
		}

		HabitatFrogasaurus["./touch.js"].getTouches = getTouches
	}

	//====== ./document.js ======
	{
		HabitatFrogasaurus["./document.js"] = {}
		const $ = (...args) => document.querySelector(...args)
		const $$ = (...args) => document.querySelectorAll(...args)

		HabitatFrogasaurus["./document.js"].$ = $
		HabitatFrogasaurus["./document.js"].$$ = $$
	}

	const { registerColourMethods } = HabitatFrogasaurus["./colour.js"]
	const { registerDebugMethods } = HabitatFrogasaurus["./console.js"]
	const { registerVectorMethods, add, crossProduct, scale, subtract } = HabitatFrogasaurus["./vector.js"]
	const { defineGetter, defineAccessor } = HabitatFrogasaurus["./property.js"]
	const { struct } = HabitatFrogasaurus["./struct.js"]
	const { keyDown } = HabitatFrogasaurus["./keyboard.js"]
	const { on, fireEvent } = HabitatFrogasaurus["./event.js"]
	const { lerp } = HabitatFrogasaurus["./lerp.js"]
}

//=========//
// EXPORTS //
//=========//
const Habitat = {
	registerMethods: HabitatFrogasaurus["./habitat.js"].registerMethods,
	registerGlobals: HabitatFrogasaurus["./habitat.js"].registerGlobals,
	registerEverything: HabitatFrogasaurus["./habitat.js"].registerEverything,
	HTML: HabitatFrogasaurus["./html.js"].HTML,
	clamp: HabitatFrogasaurus["./number.js"].clamp,
	wrap: HabitatFrogasaurus["./number.js"].wrap,
	getDigits: HabitatFrogasaurus["./number.js"].getDigits,
	gcd: HabitatFrogasaurus["./number.js"].gcd,
	simplifyRatio: HabitatFrogasaurus["./number.js"].simplifyRatio,
	range: HabitatFrogasaurus["./number.js"].range,
	memo: HabitatFrogasaurus["./memo.js"].memo,
	random: HabitatFrogasaurus["./random.js"].random,
	randomFrom: HabitatFrogasaurus["./random.js"].randomFrom,
	oneIn: HabitatFrogasaurus["./random.js"].oneIn,
	maybe: HabitatFrogasaurus["./random.js"].maybe,
	fireEvent: HabitatFrogasaurus["./event.js"].fireEvent,
	on: HabitatFrogasaurus["./event.js"].on,
	print: HabitatFrogasaurus["./console.js"].print,
	print9: HabitatFrogasaurus["./console.js"].print9,
	registerDebugMethods: HabitatFrogasaurus["./console.js"].registerDebugMethods,
	defineGetter: HabitatFrogasaurus["./property.js"].defineGetter,
	defineAccessor: HabitatFrogasaurus["./property.js"].defineAccessor,
	LinkedList: HabitatFrogasaurus["./linked-list.js"].LinkedList,
	scale: HabitatFrogasaurus["./vector.js"].scale,
	add: HabitatFrogasaurus["./vector.js"].add,
	subtract: HabitatFrogasaurus["./vector.js"].subtract,
	crossProduct: HabitatFrogasaurus["./vector.js"].crossProduct,
	distanceBetween: HabitatFrogasaurus["./vector.js"].distanceBetween,
	angleBetween: HabitatFrogasaurus["./vector.js"].angleBetween,
	registerVectorMethods: HabitatFrogasaurus["./vector.js"].registerVectorMethods,
	lerp: HabitatFrogasaurus["./lerp.js"].lerp,
	bilerp: HabitatFrogasaurus["./lerp.js"].bilerp,
	ibilerp: HabitatFrogasaurus["./lerp.js"].ibilerp,
	shuffleArray: HabitatFrogasaurus["./array.js"].shuffleArray,
	trimArray: HabitatFrogasaurus["./array.js"].trimArray,
	repeatArray: HabitatFrogasaurus["./array.js"].repeatArray,
	JavaScript: HabitatFrogasaurus["./javascript.js"].JavaScript,
	divideString: HabitatFrogasaurus["./string.js"].divideString,
	Stage: HabitatFrogasaurus["./stage.js"].Stage,
	sleep: HabitatFrogasaurus["./async.js"].sleep,
	getPointer: HabitatFrogasaurus["./pointer.js"].getPointer,
	getKeyboard: HabitatFrogasaurus["./keyboard.js"].getKeyboard,
	keyDown: HabitatFrogasaurus["./keyboard.js"].keyDown,
	keyUp: HabitatFrogasaurus["./keyboard.js"].keyUp,
	struct: HabitatFrogasaurus["./struct.js"].struct,
	Colour: HabitatFrogasaurus["./colour.js"].Colour,
	Splash: HabitatFrogasaurus["./colour.js"].Splash,
	showColour: HabitatFrogasaurus["./colour.js"].showColour,
	registerColourMethods: HabitatFrogasaurus["./colour.js"].registerColourMethods,
	VOID: HabitatFrogasaurus["./colour.js"].VOID,
	BLACK: HabitatFrogasaurus["./colour.js"].BLACK,
	GREY: HabitatFrogasaurus["./colour.js"].GREY,
	SILVER: HabitatFrogasaurus["./colour.js"].SILVER,
	WHITE: HabitatFrogasaurus["./colour.js"].WHITE,
	GREEN: HabitatFrogasaurus["./colour.js"].GREEN,
	CYAN: HabitatFrogasaurus["./colour.js"].CYAN,
	BLUE: HabitatFrogasaurus["./colour.js"].BLUE,
	PURPLE: HabitatFrogasaurus["./colour.js"].PURPLE,
	PINK: HabitatFrogasaurus["./colour.js"].PINK,
	CORAL: HabitatFrogasaurus["./colour.js"].CORAL,
	RED: HabitatFrogasaurus["./colour.js"].RED,
	ORANGE: HabitatFrogasaurus["./colour.js"].ORANGE,
	YELLOW: HabitatFrogasaurus["./colour.js"].YELLOW,
	HUES: HabitatFrogasaurus["./colour.js"].HUES,
	SHADES: HabitatFrogasaurus["./colour.js"].SHADES,
	COLOURS: HabitatFrogasaurus["./colour.js"].COLOURS,
	_: HabitatFrogasaurus["./json.js"]._,
	getMouse: HabitatFrogasaurus["./mouse.js"].getMouse,
	mouseDown: HabitatFrogasaurus["./mouse.js"].mouseDown,
	mouseUp: HabitatFrogasaurus["./mouse.js"].mouseUp,
	tween: HabitatFrogasaurus["./tween.js"].tween,
	getTouches: HabitatFrogasaurus["./touch.js"].getTouches,
	$: HabitatFrogasaurus["./document.js"].$,
	$$: HabitatFrogasaurus["./document.js"].$$,
}
