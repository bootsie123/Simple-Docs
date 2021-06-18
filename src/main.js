import Vue from 'vue'
import App from './App.vue'

const { entrypoints } = require("uxp");

Vue.config.productionTip = false

entrypoints.setup({
  panels: {
    helloworld: {
      show() {
        new Vue({
          render: h => h(App),
        }).$mount('#app')
      },
    },
  },
});
