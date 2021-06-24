import Vue from "vue";
import App from "./App.vue";

const { entrypoints } = require("uxp");

Vue.config.productionTip = false;
Vue.config.ignoredElements = ["sp-icon"];

entrypoints.setup({
  panels: {
    uxpPluginInfo: {
      show() {
        new Vue({
          render: h => h(App)
        }).$mount("#app");
      }
    }
  }
});
