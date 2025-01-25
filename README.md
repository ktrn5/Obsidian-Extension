### **README.md**

\# Code Block From Selection Plugin for Obsidian

This Obsidian plugin allows you to quickly wrap selected text in a Markdown code block. It's a handy tool for anyone working with code snippets in their notes.

\---

\#\# Features

\- \*\*Create Code Blocks\*\*: Wrap the currently selected text in a Markdown code block with a single command.  
\- \*\*Seamless Integration\*\*: Works directly within the Obsidian editor.

\---

\#\# Installation

\#\#\# Manual Installation  
1\. Download the latest release from the page.  
2\. Extract the contents to your Obsidian Vault under \`.obsidian/plugins/Obsidian-Extension\`.  
3\. Enable the plugin in Obsidian:  
   \- Go to \`Settings\` \> \`Community Plugins\`.  
   \- Click \`Browse\` and search for the plugin, or load it from the folder.  
   \- Enable the plugin.  
   \- Add a keyboard shortcut in the settings

\---

\#\# Usage

1\. Select text in the editor that you want to wrap in a code block.  
2\. Use the key combination you set up  
3\. The selected text will be wrapped in a Markdown code block:

### **Prerequisites**

* [Node.js](https://nodejs.org/) (\>=14.x)  
* [Obsidian API](https://github.com/obsidianmd/obsidian-api)

### **Steps**

Clone this repository:  
 git clone https://github.com/ktrn5/Obsidian-Extension.git  
cd Obsidian-Extension

1. 

Install dependencies:  
 npm install

2. 

Build the plugin:  
 npm run build

3.   
4. Copy the `main.js`, `manifest.json`, and `styles.css` (if any) files to your Obsidian Vault’s `.obsidian/plugins/Obsidian-Extension`  folder.

### **Development Mode**

You can enable "Hot Reload" for faster development:

Run:  
 npm run dev

*   
* Reload Obsidian to apply changes automatically.

---

## **API Reference**

### **`insertCodeBlock()`**

Wraps the currently selected text in a Markdown code block.

### **`getEditor()`**

Retrieves the active editor instance. Returns `null` if no Markdown editor is active.

---

## **Known Issues**

* The plugin only works with active Markdown files.  
* Does not check for existing code block wrapping.

---

## **Contributing**

Contributions are welcome\! Please submit issues or pull requests to improve the plugin.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](https://chatgpt.com/c/LICENSE) file for details.

This \`README.md\` file includes:  
\- A concise description of the plugin.  
\- Installation and usage instructions.  
\- Development steps for contributors.  
\- API references for clarity. 

Let me know if you'd like to modify or expand any section\! 😊

