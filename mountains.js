// Canvas setup
let canvas = null
let context = null
let width = 0
let height = 0

function clearCanvas() {
	context.clearRect(0, 0, width, height)
}

// Store seed for redrawing on scale
let previousSeed = 1

function scaleCanvas() {
	// Set canvas visible height
	const cssWidth = canvas.offsetWidth
	const cssHeight = Math.floor(cssWidth / 2)
	canvas.style.height = `${cssHeight}px`

	// Retina display support
	const scale = window.devicePixelRatio
	width = cssWidth * scale
	height = cssHeight * scale
	canvas.width = width
	canvas.height = height

	// Redraw
	seed = previousSeed
	draw()
}

function setupCanvas() {
	canvas = document.getElementById('mountain')
	context = canvas.getContext('2d')

	scaleCanvas()
}

// Randomizer
let seed = 1

// Returns a random float in the range [0, 1]
function randomFloat() {
	const m = 4294967296
	const a = 1664525
	const c = 1
	seed = (a * seed + c) % m
	return seed / m 
}

// Returns a random float in the range [min, max]
function randomFloatInRange(min, max) {
	return randomFloat() * (max - min) + min
}

function generateGradients(wavelength) {
	let gradients = []
	for (let x = 0; x < width + wavelength; x += wavelength) {
		gradients.push(randomFloatInRange(-1, 1))
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

function perlin(wavelength) {
	const gradients = generateGradients(wavelength)
	let noise = []

	for (let x = 0; x < width; x++) {
		const cornerGradients = getCornerGradients(x, wavelength, gradients)
		const dotProducts = getDotProducts(x, wavelength, gradients)
		const interpolated = interpolate(x, wavelength, dotProducts)
		noise.push(interpolated)
	}

	return noise
}

function fractal(octaves, wavelength, gradients) {
	let noise = perlin(wavelength)

	for (let i = 1; i < octaves; i++) {
		const factor = Math.pow(2, i)
		const octaveNoise = perlin(wavelength / factor)
		noise = noise.map((height, index) => height + octaveNoise[index] / factor)
	}

	return noise
}

function scaleY(y, scale, shift) {
	return (y + 1) * scale + shift
}

function formMountain(octaves, flatnessFactor, heightFactor, peaks, colors, gradient=false) {
	previousSeed = seed

	const wavelength = width / peaks
	const gradients = generateGradients(wavelength, octaves)

	if (wavelength <= 0) {
		throw Error('Wavelength must be greater than 0.')
	}

	if (octaves < 1) {
		throw Error('Octaves must be greater than 0.')
	}

	const heights = fractal(octaves, wavelength)

	const scale = height / flatnessFactor
	const heightSum = heights.reduce((first, second) => first + second) + heights.length
	const averageHeight =  heightSum / heights.length * scale
	const shift = (-height * heightFactor) + averageHeight

	const padding = 5

	context.beginPath()
	context.strokeStyle = colors[0]
	if (gradient) {
		const minHeight = scaleY(Math.min(...heights), scale, shift)
		const gradient = context.createLinearGradient(0, minHeight, 0, height)
		gradient.addColorStop(0, colors[0])
		gradient.addColorStop(1, colors[1])
		context.fillStyle = gradient
	} else {
		context.fillStyle = colors[0]
	}
	context.moveTo(-padding, height)
	context.lineTo(-padding, scaleY(heights[0], scale, shift))

	for (let x = 1; x < width; x++) {
		const y = scaleY(heights[x], scale, shift)
		context.lineTo(x, y)
	}

	context.lineTo(width + padding, scaleY(heights[width - 1], scale, shift))
	context.lineTo(width + padding, height)

	context.closePath()
	context.fill()
}

function fillBackground(colors, gradient=false) {
	if (gradient) {
		const gradient = context.createLinearGradient(0, 0, 0, height)
		gradient.addColorStop(0, colors[0])
		gradient.addColorStop(1, colors[1])
		context.fillStyle = gradient
	} else {
		context.fillStyle = colors[0]
	}
	context.fillRect(0, 0, width, height)
}

function draw() {
	clearCanvas()

	fillBackground(['#cbe8ff'])

	// Larger = rougher terrain
	let octaves = 8
	// Larger = flatter mountains
	let flatnessFactor = 3
	// Represents where the average height of the noise will be relative to the height
	let heightFactor = 0.3
	// The number of mountain peaks
	let peaks = 5
	// Color of the mountain
	let colors = ['#a0d5ff', '#498ec4']
	formMountain(octaves, flatnessFactor, heightFactor, peaks, colors, gradient=true)

	flatnessFactor = 3
	heightFactor = 0.05
	peaks = 3
	colors = ['#498ec4', '#1d6caa']
	formMountain(octaves, flatnessFactor, heightFactor, peaks, colors, gradient=true)

	flatnessFactor = 4
	heightFactor = -0.2
	peaks = 3
	colors = ['#1d6caa', '#0e5a95']
	formMountain(octaves, flatnessFactor, heightFactor, peaks, colors, gradient=true)

	flatnessFactor = 2
	heightFactor = 0.25
	peaks = 3
	colors = ['#0e5a95', '#153b59']
	formMountain(octaves, flatnessFactor, heightFactor, peaks, colors, gradient=true)

	flatnessFactor = 4
	heightFactor = -0.4
	peaks = 2
	colors = ['#153b59', '#001f37']
	formMountain(octaves, flatnessFactor, heightFactor, peaks, colors, gradient=true)
}
