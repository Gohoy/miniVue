import { h, ref } from "../../../lib/guide-min-vue.esm.js";
export default {
  name: "Child",
  setup(props, { emit }) {},
  render(proxy) {
    return h("div", {}, [h("div", {}, "child" + this.$props.msg)]);
  },
};
