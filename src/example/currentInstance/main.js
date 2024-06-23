import { createApp } from "../../../lib/guide-min-vue.esm.js"; // 使用ES模块版本
import { App } from "./App.js"; // 根据项目结构调整路径
const rootContainer = document.querySelector("#app");
createApp(App).mount(rootContainer);
