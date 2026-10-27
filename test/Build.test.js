/**
 * @jest-environment node
 */
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

const sourceFiles = (dir) =>
	fs
		.readdirSync(dir, {withFileTypes: true})
		.flatMap((entry) => (entry.isDirectory() ? sourceFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))
		.filter((file) => file.endsWith('.js'));

// Babel runs in its own process because it can't load its data files (JSON) through Jest's module system
const buildScript = `
const {transformFileSync} = require('@babel/core');
const [envName, ...files] = process.argv.slice(1);
const output = {};
files.forEach((file) => {
	output[file] = transformFileSync(file, {envName}).code;
});
process.stdout.write(JSON.stringify(output));
`;

/**
 * @param {string} envName
 * @param {string[]} files
 * @return {Object<string, string>} transpiled code by file path
 */
const build = (envName, files) =>
	JSON.parse(execFileSync(process.execPath, ['-e', buildScript, envName, ...files], {cwd: root, maxBuffer: 64 * 1024 * 1024}).toString());

const files = sourceFiles(srcDir);

describe('Testing build output', () => {
	let esm;
	let cjs;

	beforeAll(() => {
		esm = build('esm', files);
		cjs = build('cjs', files);
	});

	describe.each(files.map((file) => [path.relative(srcDir, file), file]))('%s', (name, file) => {
		it('esm build uses import/export and has no require() or core-js', () => {
			expect(esm[file]).toMatch(/^export /m);
			expect(esm[file]).not.toMatch(/\brequire\(/);
			expect(esm[file]).not.toMatch(/\bexports\./);
			expect(esm[file]).not.toMatch(/core-js/);
		});

		it('cjs build has no core-js', () => {
			expect(cjs[file]).not.toMatch(/core-js/);
		});
	});
});
