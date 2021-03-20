import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  { path: "/home", component: Home },
];

const router = new VueRouter({
  routes,
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // 判断导航将要访问的页面是否允许访问
  if (to.path === "/login") {
    //如果访问登录页，允许放行
    next();
  } else {
    // 不是登录页则要看是否有token令牌，有则放行，无则重回登录页
    const tokenStr = window.sessionStorage.getItem("token");
    if (!tokenStr) {
      next("/login");
    } else {
      next();
    }
  }
});
export default router;
