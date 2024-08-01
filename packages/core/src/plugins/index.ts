import { DevToPublisherPlugin } from "./DevToPublisherPlugin";
import { NotionPublisherPlugin } from "./NotionPublisherPlugin";
import { BlogPublisherPlugin } from "./BlogPublisherPlugin";

export const publisherPlugins = {
  devTo: DevToPublisherPlugin,
  notion: NotionPublisherPlugin,
  nativeBlog: BlogPublisherPlugin,
};

export default {
  DevToPublisherPlugin,
  NotionPublisherPlugin,
  BlogPublisherPlugin,
  publisherPlugins,
};
