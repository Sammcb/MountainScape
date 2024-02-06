// Canvas setup
let canvas = null
let context = null
let width = 0
let height = 0

function clearCanvas() {
	context.clearRect(0, 0, width, height)
}

function createMountainScape() {
	config.seed = nextSeed(config.seed)
	draw()
}

function scaleCanvas() {
	// Set canvas visible height
	const cssWidth = canvas.offsetWidth
	const cssHeight = Math.floor(cssWidth / 2)

	// Retina display support
	const scale = window.devicePixelRatio
	width = cssWidth * scale
	height = cssHeight * scale
	canvas.width = width
	canvas.height = height

	// Redraw
	draw()
}

function setupCanvas() {
	canvas = document.getElementById('mountain')
	context = canvas.getContext('2d')

	scaleCanvas()
}

function nextSeed(seed) {
	return (config.rng.a * seed + config.rng.c) % config.rng.m
}

// Returns a random float in the range [0, 1]
function randomFloat(seed) {
	const newSeed = nextSeed(seed)
	return [newSeed / config.rng.m, newSeed]
}

// Returns a random float in the range [min, max]
function randomFloatInRange(min, max, seed) {
	const [random, newSeed] = randomFloat(seed)
	return [random * (max - min) + min, newSeed]
}

function generateGradients(wavelength, initialSeed) {
	let seed = initialSeed
	let gradients = []
	for (let x = 0; x < width + wavelength; x += wavelength) {
		const [random, newSeed] = randomFloatInRange(-1, 1, seed)
		seed = newSeed
		gradients.push(random)
	}

	return gradients
}

function getCornerGradients(x, wavelength, gradients) {
	const cell = Math.floor(x / wavelength)
	return [gradients[cell], gradients[cell + 1]]
}

function getOffsetVectors(x, wavelength) {
	const normalizedX = (x % wavelength) / wavelength
	return [-normalizedX, 1 - normalizedX]
}

function getDotProducts(x, wavelength, gradients) {
	const cornerGradients = getCornerGradients(x, wavelength, gradients)
	const offsetVectors = getOffsetVectors(x, wavelength)
	return [cornerGradients[0] * offsetVectors[0], cornerGradients[1] * offsetVectors[1]]
}

function smoothstep(x) {
	if (x <= 0) {
		return 0
	} else if (x <= 1) {
		return 3 * Math.pow(x, 2) - 2 * Math.pow(x, 3)
	} else {
		return 1
	}
}

function interpolate(x, wavelength, dotProducts) {
	const normalizedX = (x % wavelength) / wavelength
	return dotProducts[0] + smoothstep(normalizedX) * (dotProducts[1] - dotProducts[0])
}

function perlin(wavelength, initialSeed) {
	const gradients = generateGradients(wavelength, initialSeed)
	let noise = []

	for (let x = 0; x < width; x++) {
		const cornerGradients = getCornerGradients(x, wavelength, gradients)
		const dotProducts = getDotProducts(x, wavelength, gradients)
		const interpolated = interpolate(x, wavelength, dotProducts)
		noise.push(interpolated)
	}

	return noise
}

function fractal(octaves, wavelength, initialSeed) {
	let noise = perlin(wavelength, initialSeed)

	for (let i = 1; i < octaves; i++) {
		const factor = Math.pow(2, i)
		const octaveNoise = perlin(wavelength / factor, initialSeed + i)
		noise = noise.map((height, index) => height + octaveNoise[index] / factor)
	}

	return noise
}

function scaleY(y, scale, shift) {
	return (y + 1) * scale + shift
}

function getHeights(octaves, flatness, heightScaler, peaks, initialSeed) {
	const wavelength = width / peaks

	if (wavelength <= 0) {
		throw Error('Wavelength must be greater than 0.')
	}

	if (octaves < 1) {
		throw Error('Octaves must be greater than 0.')
	}

	const heights = fractal(octaves, wavelength, initialSeed)
	const scale = height / flatness
	const heightSum = heights.reduce((first, second) => first + second) + heights.length
	const averageHeight =  heightSum / heights.length * scale
	const shift = (-height * heightScaler) + averageHeight
	const scaledHeights = heights.map(height => scaleY(height, scale, shift))
	return scaledHeights
}

function formMountain(octaves, flatness, heightScaler, peaks, colors, initialSeed) {
	const heights = getHeights(octaves, flatness, heightScaler, peaks, initialSeed)

	context.beginPath()

	const minHeight = Math.min(...heights)
	const gradient = context.createLinearGradient(0, minHeight, 0, height)
	const lastIndex = colors.length > 1 ? colors.length - 1 : 1
	colors.forEach((color, index) => gradient.addColorStop(index / lastIndex, `#${color}`))
	context.fillStyle = gradient

	context.moveTo(0, height)
	heights.forEach((height, index) => context.lineTo(index, height))
	context.lineTo(heights.length - 1, height)
	context.closePath()

	context.fill()
}

function fillBackground(colors) {
	const gradient = context.createLinearGradient(0, 0, 0, height)
	const lastIndex = colors.length > 1 ? colors.length - 1 : 1
	colors.forEach((color, index) => gradient.addColorStop(index / lastIndex, `#${color}`))
	context.fillStyle = gradient
	context.fillRect(0, 0, width, height)
}

function updateDownload() {
	const downloadButton = document.getElementById('download')
	downloadButton.href = canvas.toDataURL()
	downloadButton.download = 'mountains.png'
}

function draw() {
	clearCanvas()

	fillBackground(config.background)

	config.mountains.forEach((mountain, index) => {
		formMountain(mountain.octaves, mountain.flatness, mountain.height, mountain.peaks, mountain.colors, config.seed + index)
	})

	updateDownload()
	updateSVG()
}

function svgGradient(colors, id) {
	const namespace = 'http://www.w3.org/2000/svg'
	const gradient = document.createElementNS(namespace, 'linearGradient')
	gradient.setAttribute('id', id)
	gradient.setAttribute('x1', '0')
	gradient.setAttribute('x2', '0')
	gradient.setAttribute('y1', '0')
	gradient.setAttribute('y2', '1')

	const lastIndex = colors.length > 1 ? colors.length - 1 : 1
	colors.forEach((color, index) => {
		const stop = document.createElementNS(namespace, 'stop')
		stop.setAttribute('offset', `${index / lastIndex * 100}%`)
		stop.setAttribute('stop-color', `#${color}`)
		gradient.appendChild(stop)
	})

	return gradient
}

function updateSVG() {
	const namespace = 'http://www.w3.org/2000/svg'
	const svg = document.createElementNS(namespace, 'svg')
	svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
	svg.setAttribute('width', `${width}`)
	svg.setAttribute('height', `${height}`)

	const defs = document.createElementNS(namespace, 'defs')

	const backgroundGradientId = 'background'
	const backgroundGradient = svgGradient(config.background, backgroundGradientId)
	defs.appendChild(backgroundGradient)

	const background = document.createElementNS(namespace, 'rect')
	background.setAttribute('x', '0')
	background.setAttribute('y', '0')
	background.setAttribute('width', `${width}`)
	background.setAttribute('height', `${height}`)
	background.setAttribute('fill', `url(#${backgroundGradientId})`)
	svg.appendChild(background)

	config.mountains.forEach((mountain, index) => {
		const heights = getHeights(mountain.octaves, mountain.flatness, mountain.height, mountain.peaks, config.seed + index)
		const minHeight = Math.min(...heights)

		const gradientId = `mountain${index}`
		const gradient = svgGradient(mountain.colors, gradientId)
		defs.appendChild(gradient)

		const path = document.createElementNS(namespace, 'path')
		const pathComponents = [`M 0 ${height}`]

		pathComponents.push(...heights.map((height, index) => `L ${index} ${height}`))

		pathComponents.push(...[`L ${heights.length - 1} ${height}`, 'Z'])
		
		path.setAttribute('d', pathComponents.join(' '))
		path.setAttribute('fill', `url(#${gradientId})`)
		svg.appendChild(path)
	})

	svg.appendChild(defs)

	const downloadButton = document.getElementById('downloadSVG')
	const svgData = btoa(unescape(encodeURIComponent(svg.outerHTML)))
	downloadButton.href = `data:text/html;base64,${svgData}`
	downloadButton.download = 'mountains.svg'
}

// octaves: Int | larger = rougher terrain
// flatness: Double | larger = flatter mountains
// height: Double | represents where the average height of the noise will be relative to the height of the canvas
// peaks: Int | number of mountain peaks
// colors: [String] | color of the mountain. if gradient: should contain 2 colors (top, bottom), else: should contain 1 color
// gradient: Bool | wether the mountain color is a gradient or solid color
const config = {
	'rng': {
		'm': 4294967296,
		'a': 1664525,
		'c': 1
	},
	'seed': 1,
	'background': ['cbe8ff'],
	'mountains': [
		{
			'octaves': 8,
			'flatness': 3,
			'height': 0.3,
			'peaks': 5,
			'colors': ['a0d5ff', '498ec4']
		},
		{
			'octaves': 8,
			'flatness': 3,
			'height': 0.05,
			'peaks': 3,
			'colors': ['498ec4', '1d6caa']
		},
		{
			'octaves': 8,
			'flatness': 4,
			'height': -0.2,
			'peaks': 3,
			'colors': ['1d6caa', '0e5a95']
		},
		{
			'octaves': 8,
			'flatness': 2,
			'height': 0.25,
			'peaks': 3,
			'colors': ['0e5a95', '153b59']
		},
		{
			'octaves': 8,
			'flatness': 4,
			'height': -0.4,
			'peaks': 2,
			'colors': ['153b59', '001f37']
		}
	]
}
