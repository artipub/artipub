import { ImageExtension, Next, TVisitor } from "../types";
import { ProcessorContext } from "../core"
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

export function ImageCompress(context: ProcessorContext, visit: TVisitor, next: Next) {
	const { option } = context;
	if (option.compressedOptions?.compressed === false) {
		return next();
	}
	let caches = new Set();
	visit("image", async (_node, index, parent) => {
		let { url } = _node as any;
		if (url) {
			url = decodeURIComponent(url);
			if (caches.has(url)) {
				return;
			}
			let regex = /[^https?].{1,}\.(png|jpg|jpeg|svg|gif)/gim;
			if (regex.test(url)) {
				let rootDir = path.resolve(path.dirname(context.filePath));
				let filePath = path.resolve(path.join(rootDir, url));
				let extension: any = path.extname(filePath).slice(1).toLocaleLowerCase();
				if (extension === "jpg") {
					extension = "jpeg";
				}

				console.log("compress image rootDir: ", rootDir);
				console.log("compress image filePath: ", filePath);

				let buff = await fs.readFile(filePath);
				let sharpInstance = sharp(buff)[extension as ImageExtension]({ quality: option.compressedOptions?.quality || 80 });
				try {
					await sharpInstance.toFile(filePath);
					caches.add(filePath);
					console.log("compress success ! res path:", filePath);
				} catch (error) {
					console.log("compress fail ! res path:", filePath);
				}
			}
		}
	});
	next();
}
