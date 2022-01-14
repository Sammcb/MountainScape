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

function formMountain() {
	previousSeed = seed

	const wavelength = width / 2
	const octaves = 8
	const gradients = generateGradients(wavelength, octaves)

	if (wavelength <= 0) {
		throw Error('Wavelength must be greater than 0.')
	}

	if (octaves < 1) {
		throw Error('Octaves must be greater than 0.')
	}

	const heights = fractal(octaves, wavelength)

	const flatnessFactor = 2 // Larger is flatter
	const scale = height / flatnessFactor
	const heightSum = heights.reduce((first, second) => first + second) + heights.length
	const averageHeight =  heightSum / heights.length * scale
	const heightFactor = 0.5 // Between 0 and 1, represents where the average height of the noise will be relative to the height
	const shift = (-height * heightFactor) + averageHeight

	const padding = 5

	context.beginPath()
	context.strokeStyle = '#000000'
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

function draw() {
	clearCanvas()
	formMountain()
}


// function mountainY = (x, params, shift=0) => {
// 		let y = 0
// 		for (param of params) {
// 			y += 
// 		}
// 		params.forEach(param => y += param.a * (param.sin ? Math.sin(x * param.b + param.c) : Math.cos(x * param.b + param.c)))
// 		return height * y + shift
// 	};

// function placeMountain(context) {
// 	// Background mountains
// 	// Range for a = [0.01, 0.15]
// 	// Range for b = [0.005, 0.03]
// 	// Range for c = [-100, 100]
// 	let bgParams = []
// 	// Range for number of functions = [4, 10]
// 	let bgMax = rRange(4, 10)
// 	for (let i = 1; i < bgMax; i++) bgParams.push({'sin': rRange(0, 1) >= 0.5, a: rRange(0.01, 0.15), b: rRange(0.005, 0.03), c: rRange(-100, 100)})
// 	grd = context.createLinearGradient(0, 0, 0, canvas.height)
// 	grd.addColorStop(0, 'tan')
// 	// Range for dark brown to light brown transition = [0.3, 0.5]
// 	grd.addColorStop(rRange(0.3, 0.5), 'sienna')
// 	context.fillStyle = grd
// 	context.beginPath()
// 	context.moveTo(0, height)
// 	// Range for step size = [20, 30]
// 	// for (let x = 0; x <= width + 30; x += rRange(10, 20)) context.lineTo(x, mtn(x, bgParams, height / 2 - 50))
// 	// for (let x = 0; x < width; x += 1) {
// 	// 	context.lineTo(x, mtn(x, bgParams, height / 2 - 50))
// 	// }

// 	// Simulate water erosion
// 	let maxDrops = 1
// 	let flatThreshold = 5
// 	let flowDirection = (atX, atY) => {
// 		if (atX > 0) {
// 			let leftY = mtn(atX - 1, bgParams, height / 2 - 50)
// 			if (leftY - atY)
// 		}
// 		if (atX < width) {

// 		}
// 		return 0
// 	}
// 	for (let drop = 0; drop < maxDrops; drop++) {
// 		let dropX = rRange(0, width)
// 		let dropY = mtn(dropX, bgParams, height / 2 - 50)

// 	}
// 	context.lineTo(width, height)
// 	context.closePath()
// 	context.fill()
// }

// function mtnGen() {
// 	// Rng
// 	let lcg = x => seed = (1103515245 * x + 12345) % Math.pow(2, 31)
// 	let rMax = Math.pow(2, 31) - 1
// 	let rRange = (min, max) => lcg(seed) / rMax * (max - min) + min

// 	// Canvas setup
// 	canvas = document.getElementById('mtn')
// 	canvas.style.height = `${Math.floor(canvas.offsetWidth / 2)}px`
// 	let context = canvas.getContext('2d')
// 	let width = canvas.offsetWidth
// 	let height = canvas.offsetWidth / 2
// 	let scale = window.devicePixelRatio
// 	canvas.width = width * scale
// 	canvas.height = height * scale
// 	context.scale(scale, scale)
// 	context.clearRect(0, 0, canvas.width, canvas.height)
// 	context.strokeStyle = 'rgba(0, 0, 0, 0)'

// 	let mtn = (x, params, shift=0) => {
// 		let y = 0
// 		params.forEach(param => y += param.a * (param.sin ? Math.sin(x * param.b + param.c) : Math.cos(x * param.b + param.c)))
// 		return height * y + shift
// 	};

// 	// Background
// 	// bg color gradient fill (pink to purple, purple to blue, etc)
// 	let background = context.createLinearGradient(0, 0, 0, canvas.height)
// 	background.addColorStop(0, 'rebeccapurple')
// 	// Range for pink to purple transition = [0.2, 0.4]
// 	background.addColorStop(rRange(0.2, 0.4), 'lightpink')
// 	context.fillStyle = background
// 	context.fillRect(0, 0, canvas.width, canvas.height)

// 	// Sun/Moon
// 	// Range for y = [100, 400]
// 	let skyY = rRange(100, 400)
// 	let sun = context.createRadialGradient(800, skyY, 10, 800, skyY, 60)
// 	sun.addColorStop(0, 'gold')
// 	sun.addColorStop(1, 'rgba(255, 215, 0, 0.1')
// 	context.fillStyle = sun
// 	context.beginPath()
// 	context.arc(800, skyY, 50, 0, 2 * Math.PI)
// 	context.fill()

// 	placeMountain(context)
	
// 	// // Midground mountains
// 	// // Range for a = [0.01, 0.1]
// 	// // Range for b = [0.01, 0.03]
// 	// // Range for c = [-100, 100]
// 	// let mgParams = []
// 	// // Range for number of functions = [4, 8]
// 	// let mgMax = rRange(4, 8)
// 	// for (let i = 0; i < mgMax; i++) mgParams.push({'sin': rRange(0, 1) >= 0.5, a: rRange(0.01, 0.1), b: rRange(0.01, 0.03), c: rRange(-100, 100)})
// 	// grd = ctx.createLinearGradient(0, 0, 0, c.height)
// 	// grd.addColorStop(0.3, 'darkolivegreen')
// 	// // Range for dark green to light green transition = [0.6, 0.8]
// 	// grd.addColorStop(rRange(0.4, 0.5), 'darkgreen')
// 	// ctx.fillStyle = grd
// 	// ctx.beginPath()
// 	// ctx.moveTo(0, h)
// 	// // Range for step size = [20, 30]
// 	// for (let x = 0; x <= w + 30; x += rRange(20, 30)) ctx.lineTo(x, mtn(x, mgParams, h / 2 + 20))
// 	// ctx.lineTo(w, h)
// 	// ctx.closePath()
// 	// ctx.fill()

// 	// // Foreground mountains
// 	// // Range for a = [0.01, 0.07]
// 	// // Range for b = [0.01, 0.03]
// 	// // Range for c = [-100, 100]
// 	// let fgParams = []
// 	// // Range for number of functions = [4, 10]
// 	// let fgMax = rRange(4, 10)
// 	// for (let i = 0; i < fgMax; i++) fgParams.push({'sin': rRange(0, 1) >= 0.5, a: rRange(0.01, 0.07), b: rRange(0.01, 0.03), c: rRange(-100, 100)})
// 	// grd = ctx.createLinearGradient(0, 0, 0, c.height)
// 	// grd.addColorStop(0, 'lightgreen')
// 	// // Range for dark green to light green transition = [0.7, 0.9]
// 	// grd.addColorStop(rRange(0.7, 0.9), 'forestgreen')
// 	// ctx.fillStyle = grd
// 	// ctx.beginPath()
// 	// ctx.moveTo(0, h)
// 	// // Range for step size = [20, 30]
// 	// for (let x = 0; x <= w + 30; x += rRange(20, 30)) ctx.lineTo(x, mtn(x, fgParams, h / 2 + 100))
// 	// ctx.lineTo(w, h)
// 	// ctx.closePath()
// 	// ctx.fill()

// 	// // Lake
// 	// // Range for a = [0.06, 0.12]
// 	// // Range for b = [0.004, 0.0045]
// 	// // Range for c = [675, 725]
// 	// let lParams = [
// 	// 	{'sin': true, a: rRange(0.06, 0.12), b: rRange(0.004, 0.0045), c: rRange(675, 725)}
// 	// ]
// 	// grd = ctx.createLinearGradient(0, 0, 0, c.height)
// 	// // Range for dark blue to light blue transition = [0.75, 0.85]
// 	// grd.addColorStop(rRange(0.75, 0.85), 'dodgerblue')
// 	// grd.addColorStop(1, 'mediumblue')
// 	// ctx.fillStyle = grd
// 	// ctx.beginPath()
// 	// ctx.moveTo(0, h)
// 	// for (let x = 0; x <= w; x++) ctx.lineTo(x, mtn(x, lParams, h / 2 + 250))
// 	// ctx.lineTo(w, h)
// 	// ctx.closePath()
// 	// ctx.fill()
// }
