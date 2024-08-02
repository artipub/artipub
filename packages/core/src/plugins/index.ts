import { default as DevToPublisherPlugin } from "./DevToPublisherPlugin";
import { default as NotionPublisherPlugin } from "./NotionPublisherPlugin";
import { default as NativePublisherPlugin } from "./NativePublisherPlugin";

export const publisherPlugins = {
  devTo: DevToPublisherPlugin,
  notion: NotionPublisherPlugin,
  native: NativePublisherPlugin,
};

export default {
  DevToPublisherPlugin,
  NotionPublisherPlugin,
  NativePublisherPlugin,
  publisherPlugins,
};
