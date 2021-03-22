<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginout">退出</el-button>
    </el-header>
    <!-- 主体区域 -->
    <el-container>
      <!-- 左侧区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="home-asid">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          default-active="/users"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="(item, index) of menuList"
            :key="index"
          >
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + t.path"
              v-for="(t, i) of item.children"
              :key="i"
              @click="saveNavState('/' + t.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ t.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 侧边栏菜单列表数据对象
      menuList: [],
      // 菜单列表图标对象
      iconObj: {
        "125": "iconfont icon-user",
        "103": "iconfont icon-tijikongjian",
        "101": "iconfont icon-shangpin",
        "102": "iconfont icon-danju",
        "145": "iconfont icon-baobiao",
      },
      // 是否收起菜单栏
      isCollapse: false,
      // 保存菜单激活状态链接
      activePath: "",
    };
  },
  created() {
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  mounted() {
    this.getMenuList();

    // this.$http.get("menus").then((result) => {
    //   console.log(result.data);
    // });
  },
  methods: {
    loginout() {
      // 清空sessionStorage中的token
      window.sessionStorage.clear();
      // 跳转到login
      this.$router.push("/login");
    },
    // 获取菜单栏列表
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      // console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error("获取菜单列表失败");
      } else {
        // this.$message.success(res.meta.msg);
        this.menuList = res.data;
      }
    },
    // 点击div展开或隐藏菜单栏
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 点击二级菜单把菜单的激活状态保存到sessageStorage中
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
    },
  },
};
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  div {
    display: flex;
    align-items: center;
    font-size: 20px;
    color: #fff;
    span {
      margin-left: 15px;
    }
  }
}
.home-asid {
  display: flex;
  flex-direction: column;
}
.el-aside {
  background: #333744;
  .el-menu {
    border-right: none;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.1rem;
    cursor: pointer;
  }
}
.el-main {
  background: #eaedf1;
}
</style>
