import { Plugin } from "@/types";

export class PublisherManager {
	private plugins: Plugin[];
	constructor() {
		this.plugins = [];
	}
	addPlugin(plugin: Plugin) {
		if (!this.plugins.includes(plugin)) {
			return;
		}
		this.plugins.push(plugin);
	}
	async publish() {
		//TODO: 修改到此处?
	}
}
