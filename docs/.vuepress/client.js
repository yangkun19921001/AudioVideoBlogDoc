import { defineClientConfig } from "@vuepress/client";
import { defineGiscusConfig } from "vuepress-plugin-comment2/client";

import Layout from "./layouts/Layout.vue";

defineGiscusConfig({
  repo: "yangkun19921001/AudioVideoBlogDoc", //远程仓库
  repoId: "R_kgDOJ8K9Rw", //对应自己的仓库Id
  category: "Announcements",
  categoryId: "DIC_kwDOJ8K9R84CX7pn", //对应自己的分类Id
  mapping:"pathname",
  inputPosition:"top",
  lazyLoading:false,
});

export default defineClientConfig({
  layouts: {
    // we override the default layout to provide comment service
    Layout,
  },
});