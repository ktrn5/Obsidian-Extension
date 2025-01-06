import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';



export default class CodeBlockFromSelection extends Plugin {
	async onload() {

		this.addCommand({
			id: 'code-block-from-selection',
			name: 'Code block from selection',
			callback: () => this.insertCodeBlock()
		});
	}
	insertCodeBlock(): void {
		let editor = this.getEditor();
		if (editor) {
			let selectedText = editor.getSelection();
			editor.replaceSelection(`\n\`\`\`${selectedText}\n\`\`\`\n`);
		}
	}

	getEditor(): Editor | null {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			console.error("No active Markdown view");
			return null;
		}
		return view.editor;
	}


}
