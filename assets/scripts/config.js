// rng | values for LCG randomization algorithm https://en.wikipedia.org/wiki/Linear_congruential_generator

// seed: Int | starting seed for randomization

// mountains
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
