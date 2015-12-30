import * as vscode from 'vscode';
import extend = require('extend');

// look at this number of lines at the top/bottom of the file
const NUM_LINES_TO_SEARCH = 10;
// don't try to find modelines on lines longer than this
const MAX_LINE_LENGTH = 500;

export function activate(context: vscode.ExtensionContext) {
	let docWatcher = new DocumentWatcher();
	context.subscriptions.push(docWatcher);

	context.subscriptions.push(vscode.commands.registerCommand('modelines.apply', () => {
		applyModelines(vscode.window.activeTextEditor);
	}));

	setImmediate(() => applyModelines(vscode.window.activeTextEditor));
}

class DocumentWatcher {
	private _disposable: vscode.Disposable;

	constructor() {
		let subscriptions: vscode.Disposable[] = [];

		// Listen for new documents being openend
		subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => {
			// console.log('onDidOpenTextDocument: %s', doc.fileName);
			setTimeout(() => {
				let editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
				if (editor)
					applyModelines(editor);
				else
					console.log('could not find editor');
			}, 100);
		}));

		// Listen for saves and change settings if necessary
		subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => {
			// console.log('onDidSaveTextDocument: %s', doc.fileName);
			let editor = vscode.window.visibleTextEditors.find(e => e.document === doc);
			if (editor)
				applyModelines(editor);
			else
				console.log('could not find editor');
		}));

		this._disposable = vscode.Disposable.from(...subscriptions);
	}

	public dispose(): void {
		this._disposable.dispose();
	}
}

export class ModelineSearcher {
	private document: vscode.TextDocument;

	constructor(doc: vscode.TextDocument) {
		this.document = doc;
	}

	public getModelineOptions(): any {
		let searchLines = this.getLinesToSearch();
		return extend({},
			this.getVimModelineOptions(searchLines),
			this.getEmacsModelineOptions(searchLines),
			this.getVSCodeModelineOptions(searchLines));
	}

	private getVSCodeModelineOptions(searchLines:string[]): any {
		let codeModelineRegex = /^.{0,8}code:(.*)/;
		let codeModelineOptsRegex = /(\w+)=([^\s]+)/g;

		let parseOption = (name:string, value:string) => {
			let newname = name.replace('editor.', '');
			let newval = this._parseGenericValue(value);

			switch (newname.toLowerCase()) {
				case 'insertspaces': newname = 'insertSpaces'; break;
				case 'tabsize': newname = 'tabSize'; break;
			}

			let result = {};
			result[newname] = newval;
			return result;
		};

		let options = {};
		searchLines.forEach(line => {
			let match = line.match(codeModelineRegex);
			if (match) {
				let opts = match[1];
				while (match = codeModelineOptsRegex.exec(opts))
					extend(options, parseOption(match[1], match[2]));
			}
		});
		return options;
	}

	private getVimModelineOptions(searchLines:string[]): any {
		let codeModelineRegex = /^.{0,8}vim:(.*)/;
		let codeModelineOptsRegex = /(\w+)=([^:\s]+)|(\w+)/g;

		let parseOption = (name:string, value:string):any => {
			let parsedVal = this._parseGenericValue(value);
			switch (name) {
				case 'expandtab': case 'et':
					return { insertSpaces: true };
				case 'noexpandtab': case 'noet':
					return { insertSpaces: false };
				case 'tabstop': case 'ts':
				case 'softtabstop': case 'sts':
				case 'shiftwidth': case 'sw':
					return { tabSize: parsedVal };
				default:
					return {};
			}
		};

		let options = {};
		searchLines.forEach(line => {
			let match = line.match(codeModelineRegex);
			if (match) {
				let opts = match[1];
				while (match = codeModelineOptsRegex.exec(opts))
					extend(options, parseOption(match[1] || match[3], match[2]));
			}
		});

		return options;
	}

	private getEmacsModelineOptions(searchLines:string[]): any {
		return {};
	}

	private getLinesToSearch(): string[] {
		let lines = this.document.getText().split(/\n/g);
		let checkNumLines = NUM_LINES_TO_SEARCH;
		// avoid checking same line multiple times if file doesn't have enough lines
		if (lines.length < NUM_LINES_TO_SEARCH*2)
			checkNumLines = lines.length / 2;
		let topLines = lines.slice(0, checkNumLines),
			bottomLines = lines.slice(-checkNumLines);
		return topLines.concat(bottomLines).filter(line => line.length <= MAX_LINE_LENGTH);
	}

	private _parseGenericValue(value:string): any {
		if (typeof value != 'string') return value;
		if (/^(true|false)$/i.test(value)) {
			return value.toLowerCase() == 'true';
		} else if (/^[0-9]+$/.test(value)) {
			return parseInt(value, 10);
		}
		return value.replace(/['"]/g, '');
	}
}

export function applyModelines(editor: vscode.TextEditor): void {
	if (!editor || editor.document.isUntitled)
		return;
	try {
		editor.show
		let searcher = new ModelineSearcher(editor.document);
		let options = searcher.getModelineOptions();
		//console.log('[modelines] setting editor options: %s', JSON.stringify(options, null, "\t"));
		extend(editor.options, options);
		// assignment is necessary to trigger the change
		editor.options = editor.options;
	} catch (err) {
		// using string errors internally to represent errors to show to user
		if (typeof err == 'string')
			vscode.window.showErrorMessage('Modeline error: %s', err);
		else
			console.error(err);
	}
}
