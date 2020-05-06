module.exports = {
	clearMocks: true,
	collectCoverage: true,
	collectCoverageFrom: ['**/src/**/**.js', '!**/src/helpers.js**'],
	moduleFileExtensions: ['js'],
	setupFiles: [],
	testEnvironment: 'jsdom',
	testMatch: ['**/test/**/?(*.)+(spec|test).js'],
	testPathIgnorePatterns: ['\\\\node_modules\\\\'],
	testURL: 'http://localhost',
	transformIgnorePatterns: ['<rootDir>/node_modules/'],
	verbose: true,
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
