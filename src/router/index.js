import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Welcome from "../views/Welcome.vue";
import Users from "../views/user/Users.vue";
import Roles from "../views/power/Roles.vue";
import Rights from "../views/power/Rights.vue";
import Goods from "../views/goods/Goods.vue";
import Params from "../views/goods/Params.vue";
import Categories from "../views/goods/Categories.vue";
import Orders from "../views/order/Orders.vue";
import Reports from "../views/report/Reports.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      { path: "/welcome", component: Welcome },
      { path: "/users", component: Users },
      { path: "/Roles", component: Roles },
      { path: "/Rights", component: Rights },
      { path: "/Goods", component: Goods },
      { path: "/Params", component: Params },
      { path: "/Categories", component: Categories },
      { path: "/Orders", component: Orders },
      { path: "/Reports", component: Reports },
    ],
  },
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
      return next("/login");
    } else {
      return next();
    }
  }
});
export default router;
