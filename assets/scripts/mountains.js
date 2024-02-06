function nextSeed(seed) {
	return (config.rng.a * seed + config.rng.c) % config.rng.m
}

function generateMountainScape() {
	config.seed = nextSeed(config.seed)
	updateSVG()
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

function generateGradients(wavelength, width, initialSeed) {
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

function perlin(wavelength, width, initialSeed) {
	const gradients = generateGradients(wavelength, width, initialSeed)
	let noise = []

	for (let x = 0; x < width; x++) {
		const cornerGradients = getCornerGradients(x, wavelength, gradients)
		const dotProducts = getDotProducts(x, wavelength, gradients)
		const interpolated = interpolate(x, wavelength, dotProducts)
		noise.push(interpolated)
	}

	return noise
}

function fractal(octaves, wavelength, width, initialSeed) {
	let noise = perlin(wavelength, width, initialSeed)

	for (let i = 1; i < octaves; i++) {
		const factor = Math.pow(2, i)
		const octaveNoise = perlin(wavelength / factor, width, initialSeed + i)
		noise = noise.map((height, index) => height + octaveNoise[index] / factor)
	}

	return noise
}

function scaleY(y, scale, shift) {
	return (y + 1) * scale + shift
}

function getHeights(width, maxHeight, octaves, flatness, heightScaler, peaks, initialSeed) {
	const wavelength = width / peaks

	if (wavelength <= 0) {
		throw Error('Wavelength must be greater than 0.')
	}

	if (octaves < 1) {
		throw Error('Octaves must be greater than 0.')
	}

	const heights = fractal(octaves, wavelength, width, initialSeed)
	const scale = maxHeight / flatness
	const heightSum = heights.reduce((first, second) => first + second) + heights.length
	const averageHeight =  heightSum / heights.length * scale
	const shift = (-maxHeight * heightScaler) + averageHeight
	const scaledHeights = heights.map(height => scaleY(height, scale, shift)).map(height => Math.round(height))
	return scaledHeights
}
