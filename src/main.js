import Vue from "vue";
import App from "./App.vue";
import { LMap, LTileLayer, LMarker } from "vue2-leaflet";
import "leaflet/dist/leaflet.css";
import vuetify from "./plugins/vuetify";
import store from "./store";
import router from "./router";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import VueCssDoodle from '@luxdamore/vue-css-doodle';
import '@luxdamore/vue-css-doodle/dist/VueCssDoodle.css';

// Install
Vue.use(
    VueCssDoodle
);
Vue.component("l-map", LMap);
Vue.component("l-tile-layer", LTileLayer);
Vue.component("l-marker", LMarker);
Vue.config.productionTip = false;
import VueApexCharts from 'vue-apexcharts'
Vue.use(VueApexCharts)

Vue.component('apexchart', VueApexCharts)
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
new Vue({
  vuetify,
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");
