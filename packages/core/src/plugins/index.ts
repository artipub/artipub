import DevToPublisherPlugin from "./DevToPublisherPlugin";
import NotionPublisherPlugin from "./NotionPublisherPlugin";
import NativePublisherPlugin from "./NativePublisherPlugin";

export const publisherPlugins = {
  devTo: DevToPublisherPlugin,
  notion: NotionPublisherPlugin,
  native: NativePublisherPlugin,
};

export { default as DevToPublisherPlugin } from "./DevToPublisherPlugin";
export { default as NotionPublisherPlugin } from "./NotionPublisherPlugin";
export { default as NativePublisherPlugin } from "./NativePublisherPlugin";
