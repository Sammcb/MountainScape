const canvasId = 'mountain'

function scaleCanvas() {
	const canvas = document.getElementById(canvasId)

	// Set canvas visible height
	const cssWidth = canvas.offsetWidth
	const cssHeight = Math.floor(cssWidth / 2)

	// Retina display support
	const scale = window.devicePixelRatio
	canvas.width = cssWidth * scale
	canvas.height = cssHeight * scale

	// Redraw
	draw()
}

function clearCanvas() {
	const canvas = document.getElementById(canvasId)
	const context = canvas.getContext('2d')

	context.clearRect(0, 0, canvas.width, canvas.height)
}

function formMountain(octaves, flatness, heightScaler, peaks, colors, initialSeed) {
	const canvas = document.getElementById(canvasId)
	const context = canvas.getContext('2d')

	const heights = getHeights(canvas.width, canvas.height, octaves, flatness, heightScaler, peaks, initialSeed)

	context.beginPath()

	const minHeight = Math.min(...heights)
	const gradient = context.createLinearGradient(0, minHeight, 0, canvas.height)
	const lastIndex = colors.length > 1 ? colors.length - 1 : 1
	colors.forEach((color, index) => gradient.addColorStop(index / lastIndex, `#${color}`))
	context.fillStyle = gradient

	context.moveTo(0, canvas.height)
	heights.forEach((height, index) => context.lineTo(index, height))
	context.lineTo(heights.length - 1, canvas.height)
	context.closePath()

	context.fill()
}

function fillBackground(colors) {
	const canvas = document.getElementById(canvasId)
	const context = canvas.getContext('2d')

	const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
	const lastIndex = colors.length > 1 ? colors.length - 1 : 1
	colors.forEach((color, index) => gradient.addColorStop(index / lastIndex, `#${color}`))
	context.fillStyle = gradient
	context.fillRect(0, 0, canvas.width, canvas.height)
}

function draw() {
	clearCanvas()

	fillBackground(config.background)

	config.mountains.forEach((mountain, index) => {
		formMountain(mountain.octaves, mountain.flatness, mountain.height, mountain.peaks, mountain.colors, config.seed + index)
	})

	updateDownload()
}

function updateDownload() {
	const canvas = document.getElementById(canvasId)
	const downloadButton = document.getElementById('download')
	downloadButton.href = canvas.toDataURL()
}
