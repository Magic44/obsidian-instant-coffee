import {App, Command, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {hexToRgba} from "./utils/utils";
import {triggerAsyncId} from "node:async_hooks";
import {commands} from "codemirror";

// Remember to rename these classes and interfaces!


interface MyPluginSettings {
	mySetting: string;
	highlightColor: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default1',
	highlightColor: "rgba(157, 123, 218, 0.51)", // 默认颜色
}


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// # Add a expand btn for query block
		this.registerMarkdownPostProcessor((element, context) => {
			const targetElement = element.querySelector('.internal-query-header');
			const newSiblingElement = document.createElement('button'); // 可以是任何类型的元素
			newSiblingElement.className = 'new-sibling-button'; // 添加类名
			newSiblingElement.textContent = '展开全部'; // 设置文本内容
			newSiblingElement.style.marginLeft = '30px'

			newSiblingElement.onclick = (ev) => {
				const target = ev.target as HTMLElement
				const searchResultItem = target.closest(".el-pre");

				if (searchResultItem){
					const itemList = searchResultItem.querySelectorAll('.search-result-file-match');
					itemList.forEach((item: any)  => {
						const btnList = item.querySelectorAll('.search-result-hover-button')
						btnList[1].click()
					})
				}
				// Hide the expand-btn
				target.style.display = 'none'
			}
			targetElement && targetElement.appendChild(newSiblingElement)
		});


		// #  A click-highlight for search-result item
		this.registerDomEvent(document, "click", (event) => {
			const target = event.target as HTMLElement;
			const searchResultItem = target.closest(".search-result-file-match.tappable");
			if (searchResultItem) {
				document.querySelectorAll(".search-result-file-match.tappable.highlighted")
					.forEach((el) => {
						el.classList.remove("highlighted");
					});
				searchResultItem.classList.add("highlighted");
			}
		});
		const highlightColor = this.settings.highlightColor
		const rgba = hexToRgba(highlightColor, '0.5')
		const styles = `
			.search-result-file-match.tappable.highlighted {
				background-color: ${rgba} !important;
				border-radius: 4px;
			}
		`;
		const style = document.createElement("style");
		style.textContent = styles
		document.head.appendChild(style);


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('diamond', 'Light/Dark Toggle', (evt: MouseEvent) => {

		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			// console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}


	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Highlight Color')
			.setDesc("It will work when the plugin is reload")
			.addColorPicker((colorComponent) => colorComponent
				.setValue(this.plugin.settings.highlightColor)
				.onChange(async (value) => {
					console.log("onChange", value)
					this.plugin.settings.highlightColor = value;
					await this.plugin.saveSettings();
				}))

	}
}
