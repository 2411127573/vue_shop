import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import ElementUI from "element-ui";
import { Message } from "element-ui";
import { MessageBox } from "element-ui";

import "element-ui/lib/theme-chalk/index.css";
//导入全局样式
import "./assets/css/global.css";
// 导入字体图标样式
import "./assets/fonts/iconfont.css";
// 导入element-ui组件
// import { Form, FormItem, Input, Button } from "element-ui";
// Vue.use(Form);
// Vue.use(FormItem);
// Vue.use(Input);
// Vue.use(Button);

Vue.config.productionTip = false;
Vue.use(ElementUI);
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// 请求拦截器
axios.interceptors.request.use((config) => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.prototype.$http = axios;
Vue.prototype.$message = Message;
Vue.prototype.$confirm = MessageBox.confirm;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
