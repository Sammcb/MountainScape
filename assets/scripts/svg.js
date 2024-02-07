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
	svg.setAttribute('xmlns', namespace)

	const width = 2048
	const maxHeight = width / 2
	svg.setAttribute('width', `${width}`)
	svg.setAttribute('height', `${maxHeight}`)

	const defs = document.createElementNS(namespace, 'defs')

	const backgroundGradientId = 'background'
	const backgroundGradient = svgGradient(config.background, backgroundGradientId)
	defs.appendChild(backgroundGradient)

	const background = document.createElementNS(namespace, 'rect')
	background.setAttribute('x', '0')
	background.setAttribute('y', '0')
	background.setAttribute('width', `${width}`)
	background.setAttribute('height', `${maxHeight}`)
	background.setAttribute('fill', `url(#${backgroundGradientId})`)
	svg.appendChild(background)

	config.mountains.forEach((mountain, index) => {
		const heights = getHeights(width + 1, maxHeight, mountain.octaves, mountain.flatness, mountain.height, mountain.peaks, config.seed + index)
		const minHeight = Math.min(...heights)

		const gradientId = `mountain${index}`
		const gradient = svgGradient(mountain.colors, gradientId)
		defs.appendChild(gradient)

		const path = document.createElementNS(namespace, 'path')
		const pathComponents = [`M 0 ${maxHeight}`]

		pathComponents.push(...heights.map((height, heightIndex) => `L ${heightIndex} ${height}`))

		pathComponents.push(...[`L ${heights.length - 1} ${maxHeight}`, 'Z'])
		
		path.setAttribute('d', pathComponents.join(' '))
		path.setAttribute('fill', `url(#${gradientId})`)
		svg.appendChild(path)
	})

	svg.insertBefore(defs, svg.firstChild)

	const downloadButton = document.getElementById('downloadSVG')
	const svgData = btoa(unescape(encodeURIComponent(svg.outerHTML)))
	downloadButton.href = `data:text/html;base64,${svgData}`
}
