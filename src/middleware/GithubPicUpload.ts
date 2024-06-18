import { GithubPicBedOption, Next, TVisitor } from "../types";
import { ProcessorContext } from "../core"
import path from "path";
import fs from "fs/promises"
import mime from "mime";
import axios from "axios"
import { log } from "@/utils";

export default async function GithubPicUpload(context: ProcessorContext, visit: TVisitor, next: Next) {
	const { option: { uploadImgOption } } = context;
	const picBedOption = uploadImgOption as GithubPicBedOption;

	let caches = new Set();
	await visit("image", async (_node, _index, _parent) => {
		let node = _node as any;
		if (node.url) {
			let url = decodeURIComponent(node.url);
			if (caches.has(url)) {
				return;
			}
			let regex = /[^https?].{1,}\.(png|jpg|jpeg|svg|gif)/gim;
			if (regex.test(url)) {
				let rootDir = path.resolve(path.dirname(context.filePath));
				let filePath = path.resolve(path.join(rootDir, url));
				let extension = path.extname(filePath);

				let content = await fs.readFile(filePath);
				let contentBase64 = content.toString("base64");
				let fileName = Date.now();
				let githubPath = `${picBedOption.dir}/${fileName}${extension}`;

				let commitData = JSON.stringify({
					message: "commit image",
					committer: {
						name: picBedOption.commit_author,
						email: picBedOption.commit_email,
					},
					content: contentBase64,
				});

				const contentType = mime.getType(filePath);
				const config = {
					method: "put",
					url: `https://api.github.com/repos/${picBedOption.owner}/${picBedOption.repo}/contents/${githubPath}`,
					headers: {
						Authorization: `Bearer ${picBedOption.token}`,
						"Content-Type": contentType,
						"X-GitHub-Api-Version": "2022-11-28",
						Accept: "application/vnd.github+json",
					},
					data: commitData,
				};

				try {
					const response = await axios(config);
					if (response.status == 201) {
						node.url = response.data.content.download_url;
					}
				} catch (error) {
					log.error("upload a image fail !", error);
				}
			}
		}
	});
	next();
}
