import { defineArtiConfig } from "artipub"
export default defineArtiConfig({
	articleProcessor: {
		sourceDir: "./articles",
		outputDir: "./dist",
		imageHost: {
			type: "github",
			options: {
				repo: "username/repo",
				token: "ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
				path: "images/"
			}
		},
		compressImages: true
	},
	publishers: [
		{
			type: "notion",
			options: {
				token: "secret_xxx",
				databaseId: "xxxxxx"
			}
		},
		{
			type: "dev.to",
			options: {
				apiKey: "YOUR_API_KEY",
				coverImageBasePath: "https://example.com/images/"
			}
		}
	]
});
