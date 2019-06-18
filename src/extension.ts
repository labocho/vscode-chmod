// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { spawnSync } from 'child_process';
import { TextDecoder } from 'util';

function getCurrentFileName(): string | null {
	const t = vscode.window.activeTextEditor;
	if (t === undefined) { return null; }
	return t.document.fileName;
}

function sh(cmd: string, args: Array<string>): string | null {
	const r = spawnSync(cmd, args, { cwd: vscode.workspace.rootPath, encoding: "buffer" });
	if (r.status !== 0) {
		const s = new TextDecoder().decode(r.stderr);
		vscode.window.showErrorMessage(s);
		return null;
	}

	return new TextDecoder().decode(r.stdout);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.chmod', () => {
		const filename = getCurrentFileName();
		if (filename === null) { return; }

		const ls_out = sh("ls", ["-l", filename]);
		if (ls_out === null) { return; }
		const current_mode = ls_out.replace(/ .*/, "");

		vscode.window.showInputBox({ prompt: `Input chmod's 2nd argument (now: ${current_mode})`, value: "+x"}).then((mode) => {
			if (typeof(mode) !== "string") { return; }

			if (sh("chmod", [mode, filename]) !== null) {
				vscode.window.showInformationMessage(`Done: chmod ${mode} ${filename}`);
			}
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
