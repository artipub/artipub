import { Plugin, PublishResult } from "@/types";
import { isFunction } from "@/utils";

export class PublisherManager {
	private plugins: Plugin[];
	constructor() {
		this.plugins = [];
	}
	addPlugin(plugin: Plugin) {
		if (!isFunction(plugin)) {
			throw new Error("Plugin must be a function");
		}
		if (!this.plugins.includes(plugin)) {
			return;
		}
		this.plugins.push(plugin);
	}
	async publish(filePath: string, content: string) {
		let res: PublishResult[] = [];
		for (let plugin of this.plugins) {
			res.push(await plugin(filePath, content));
		}
		return res;
	}
}
