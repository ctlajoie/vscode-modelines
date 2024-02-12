import * as path from 'path';
import fs = require('fs');

import { runTests } from '@vscode/test-electron';

async function go() {
	try {
		const basedir = path.resolve(__dirname, '../../');
		/**
		 * Compatibility copy from bin/test in deprecated vscode module
		 */
		let testsFolder;
		if (process.env.CODE_TESTS_PATH) {
			testsFolder = process.env.CODE_TESTS_PATH;
		} else if (fs.existsSync(path.join(basedir, 'out', 'test'))) {
			testsFolder = path.join(basedir, 'out', 'test'); // TS extension
		} else {
			testsFolder = path.join(basedir, 'test'); // JS extension
		}

		const testsWorkspace = process.env.CODE_TESTS_WORKSPACE ?? testsFolder;
		const extensionDevelopmentPath = process.env.CODE_EXTENSIONS_PATH ?? basedir;
		const locale = process.env.CODE_LOCALE ?? 'en';
		const userDataDir = process.env.CODE_TESTS_DATA_DIR;

		const extensionTestsPath = testsFolder;

		const addargs = [
			testsWorkspace,
			'--locale=' + locale,
		];

		if (userDataDir) {
			addargs.push('--user-data-dir=' + userDataDir);
		}

		if (process.env.CODE_DISABLE_EXTENSIONS) {
			addargs.push('--disable-extensions');
		}


		if (process.env.CODE_VERSION) {
			await runTests({
				version: process.env.CODE_VERSION,
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: addargs,
			});
		} else {
			await runTests({
				extensionDevelopmentPath,
				extensionTestsPath,
				launchArgs: addargs,
			});
		}
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

go();