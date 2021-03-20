<template>
  <div>
    <el-button type="info" @click="loginout">退出</el-button>
  </div>
</template>
<script>
export default {
  methods: {
    loginout() {
      // 清空sessionStorage中的token
      window.sessionStorage.clear();
      // 跳转到login
      this.$router.push("/login");
    },
  },
};
</script>
